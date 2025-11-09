export interface Forecaster {
  id: string;
  name: string;
  username?: string;
  platform?: string;
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Source {
  id: string;
  forecaster_id?: string;
  url: string;
  platform: string;
  title?: string;
  content?: string;
  published_at?: Date;
  created_at: Date;
}

export type ClaimType = 'numeric' | 'categorical' | 'probabilistic';
export type ClaimStatus = 'pending' | 'resolved' | 'expired' | 'invalid';
export type Domain = 'economy' | 'politics' | 'technology' | 'earthquakes';

export interface Claim {
  id: string;
  forecaster_id?: string;
  source_id?: string;
  text: string;
  domain: Domain;
  predicted_value?: number;
  predicted_category?: string;
  predicted_probability?: number;
  claim_type: ClaimType;
  deadline_date?: Date;
  status: ClaimStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Outcome {
  id: string;
  claim_id: string;
  actual_value?: number;
  actual_category?: string;
  actual_probability?: number;
  perimeter_score: number;
  data_source?: string;
  verified_at?: Date;
  created_at: Date;
}

export interface ClaimTag {
  id: string;
  claim_id: string;
  tag: string;
  tag_type?: string;
  created_at: Date;
}

export interface CreateClaimRequest {
  text: string;
  domain: Domain;
  forecaster_id?: string;
  source_id?: string;
  predicted_value?: number;
  predicted_category?: string;
  predicted_probability?: number;
  claim_type: ClaimType;
  deadline_date?: string;
  tags?: string[];
  source_url?: string;
  forecaster_name?: string;
  forecaster_username?: string;
  forecaster_platform?: string;
}

export interface ResolveClaimRequest {
  actual_value?: number;
  actual_category?: string;
  actual_probability?: number;
  data_source?: string;
}

export interface LeaderboardQuery {
  domain?: Domain;
  period?: string; // e.g., '1y', '6m', '3m', '1m'
  min_claims?: number;
  limit?: number;
}

export interface LeaderboardEntry {
  forecaster_id: string;
  forecaster_name: string;
  forecaster_username?: string;
  total_claims: number;
  resolved_claims: number;
  average_perimeter: number;
  weighted_perimeter: number;
}

