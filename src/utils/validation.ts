import { z } from 'zod';

export const claimTypeSchema = z.enum(['numeric', 'categorical', 'probabilistic']);
export const domainSchema = z.enum(['economy', 'politics', 'technology', 'earthquakes']);
export const statusSchema = z.enum(['pending', 'resolved', 'expired', 'invalid']);

export const uuidSchema = z.string().uuid();

export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export function validateDomain(domain: string): boolean {
  return domainSchema.safeParse(domain).success;
}

export function validateClaimType(type: string): boolean {
  return claimTypeSchema.safeParse(type).success;
}

