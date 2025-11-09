import { ClaimType, Claim, Outcome } from '../types';

/**
 * Calculate Perimeter score for a claim and its outcome
 * 
 * Perimeter = 100 * (1 - |Predicted - Actual| / Range)
 * 
 * For numeric claims: Uses domain-specific ranges
 * For categorical claims: 100 if match, 0 if not
 * For probabilistic claims: Uses Brier score
 */
export class PerimeterCalculator {
  // Domain-specific ranges for numeric predictions
  private static readonly DOMAIN_RANGES: Record<string, { min: number; max: number }> = {
    economy: {
      // CPI percentage range (example: -5% to 100%)
      cpi: { min: -5, max: 100 },
      // Exchange rate ranges (example: 0.1x to 10x)
      exchange: { min: 0.1, max: 100 },
      // GDP growth percentage
      gdp: { min: -20, max: 20 },
      // Default economy range
      default: { min: -50, max: 100 },
    },
    politics: {
      // Election percentages
      election: { min: 0, max: 100 },
      // Approval ratings
      approval: { min: 0, max: 100 },
      default: { min: 0, max: 100 },
    },
    technology: {
      // Stock prices (normalized)
      stock: { min: 0, max: 1000 },
      // Market share percentages
      market: { min: 0, max: 100 },
      default: { min: 0, max: 100 },
    },
    earthquakes: {
      // Magnitude range
      magnitude: { min: 0, max: 10 },
      // Depth in km
      depth: { min: 0, max: 700 },
      default: { min: 0, max: 10 },
    },
  };

  /**
   * Calculate Perimeter score for a numeric claim
   */
  private static calculateNumeric(
    predicted: number,
    actual: number,
    domain: string,
    range?: { min: number; max: number }
  ): number {
    // Use provided range or domain default
    const domainRange = range || this.DOMAIN_RANGES[domain]?.default || { min: 0, max: 100 };
    const rangeSize = domainRange.max - domainRange.min;

    if (rangeSize === 0) {
      return predicted === actual ? 100 : 0;
    }

    const error = Math.abs(predicted - actual);
    const normalizedError = error / rangeSize;
    const perimeter = 100 * (1 - normalizedError);

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, perimeter));
  }

  /**
   * Calculate Perimeter score for a categorical claim
   */
  private static calculateCategorical(
    predicted: string,
    actual: string
  ): number {
    // Exact match
    if (predicted.toLowerCase().trim() === actual.toLowerCase().trim()) {
      return 100;
    }

    // Partial match (contains)
    if (
      predicted.toLowerCase().includes(actual.toLowerCase()) ||
      actual.toLowerCase().includes(predicted.toLowerCase())
    ) {
      return 50;
    }

    return 0;
  }

  /**
   * Calculate Perimeter score for a probabilistic claim using Brier score
   * Brier Score = (predicted - actual)^2
   * Perimeter = 100 * (1 - Brier Score)
   */
  private static calculateProbabilistic(
    predicted: number,
    actual: number
  ): number {
    // actual should be 0 or 1 for binary outcomes
    const brierScore = Math.pow(predicted - actual, 2);
    const perimeter = 100 * (1 - brierScore);

    return Math.max(0, Math.min(100, perimeter));
  }

  /**
   * Main method to calculate Perimeter score
   */
  static calculate(claim: Claim, outcome: Outcome): number {
    if (!claim.predicted_value && !claim.predicted_category && claim.predicted_probability === undefined) {
      throw new Error('Claim must have a predicted value, category, or probability');
    }

    if (
      outcome.actual_value === undefined &&
      !outcome.actual_category &&
      outcome.actual_probability === undefined
    ) {
      throw new Error('Outcome must have an actual value, category, or probability');
    }

    switch (claim.claim_type) {
      case 'numeric':
        if (claim.predicted_value === undefined || outcome.actual_value === undefined) {
          throw new Error('Numeric claim requires predicted_value and actual_value');
        }
        return this.calculateNumeric(
          claim.predicted_value,
          outcome.actual_value,
          claim.domain
        );

      case 'categorical':
        if (!claim.predicted_category || !outcome.actual_category) {
          throw new Error('Categorical claim requires predicted_category and actual_category');
        }
        return this.calculateCategorical(
          claim.predicted_category,
          outcome.actual_category
        );

      case 'probabilistic':
        if (
          claim.predicted_probability === undefined ||
          outcome.actual_probability === undefined
        ) {
          throw new Error('Probabilistic claim requires predicted_probability and actual_probability');
        }
        return this.calculateProbabilistic(
          claim.predicted_probability,
          outcome.actual_probability
        );

      default:
        throw new Error(`Unknown claim type: ${claim.claim_type}`);
    }
  }

  /**
   * Calculate weighted average Perimeter score for multiple claims
   */
  static calculateWeightedAverage(
    claims: Array<{ claim: Claim; outcome: Outcome }>
  ): number {
    if (claims.length === 0) {
      return 0;
    }

    const scores = claims.map(({ claim, outcome }) => ({
      perimeter: this.calculate(claim, outcome),
      weight: 1, // Can be adjusted based on claim importance, recency, etc.
    }));

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce((sum, s) => sum + s.perimeter * s.weight, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

