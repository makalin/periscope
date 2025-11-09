import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/connection';
import { PerimeterCalculator } from '../../scoring/perimeter';
import {
  CreateClaimRequest,
  ResolveClaimRequest,
  Claim,
  Outcome,
} from '../../types';

const createClaimSchema = z.object({
  text: z.string().min(1),
  domain: z.enum(['economy', 'politics', 'technology', 'earthquakes']),
  forecaster_id: z.string().uuid().optional(),
  source_id: z.string().uuid().optional(),
  predicted_value: z.number().optional(),
  predicted_category: z.string().optional(),
  predicted_probability: z.number().min(0).max(1).optional(),
  claim_type: z.enum(['numeric', 'categorical', 'probabilistic']),
  deadline_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source_url: z.string().url().optional(),
  forecaster_name: z.string().optional(),
  forecaster_username: z.string().optional(),
  forecaster_platform: z.string().optional(),
});

const resolveClaimSchema = z.object({
  actual_value: z.number().optional(),
  actual_category: z.string().optional(),
  actual_probability: z.number().min(0).max(1).optional(),
  data_source: z.string().optional(),
});

export async function claimsRoutes(fastify: FastifyInstance) {
  // POST /v1/claims - Create a new claim
  fastify.post(
    '/',
    async (request: FastifyRequest<{ Body: CreateClaimRequest }>, reply: FastifyReply) => {
      try {
        const body = createClaimSchema.parse(request.body);

        // Create or get forecaster if provided
        let forecasterId = body.forecaster_id;
        if (!forecasterId && (body.forecaster_name || body.forecaster_username)) {
          const forecasterResult = await query(
            `INSERT INTO forecaster (name, username, platform, verified)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (username, platform) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [
              body.forecaster_name || 'Unknown',
              body.forecaster_username || null,
              body.forecaster_platform || 'manual',
              false,
            ]
          );
          forecasterId = forecasterResult.rows[0]?.id;
        }

        // Create source if URL provided
        let sourceId = body.source_id;
        if (!sourceId && body.source_url) {
          const sourceResult = await query(
            `INSERT INTO source (forecaster_id, url, platform, published_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
             RETURNING id`,
            [
              forecasterId || null,
              body.source_url,
              body.forecaster_platform || 'manual',
              new Date(),
            ]
          );
          sourceId = sourceResult.rows[0]?.id;
        }

        // Create claim
        const claimResult = await query(
          `INSERT INTO claim (
            forecaster_id, source_id, text, domain, predicted_value,
            predicted_category, predicted_probability, claim_type, deadline_date, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            forecasterId || null,
            sourceId || null,
            body.text,
            body.domain,
            body.predicted_value || null,
            body.predicted_category || null,
            body.predicted_probability || null,
            body.claim_type,
            body.deadline_date || null,
            'pending',
          ]
        );

        const claim = claimResult.rows[0];

        // Add tags if provided
        if (body.tags && body.tags.length > 0) {
          for (const tag of body.tags) {
            await query(
              `INSERT INTO claim_tag (claim_id, tag)
               VALUES ($1, $2)
               ON CONFLICT (claim_id, tag) DO NOTHING`,
              [claim.id, tag]
            );
          }
        }

        reply.code(201).send(claim);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          reply.code(400).send({ error: 'Validation error', details: error.errors });
        } else {
          fastify.log.error(error);
          reply.code(500).send({ error: 'Failed to create claim' });
        }
      }
    }
  );

  // GET /v1/claims/:id - Get a specific claim
  fastify.get(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;

        const claimResult = await query(
          `SELECT c.*, 
                  f.name as forecaster_name, f.username as forecaster_username,
                  s.url as source_url,
                  o.perimeter_score, o.actual_value, o.actual_category, o.actual_probability
           FROM claim c
           LEFT JOIN forecaster f ON c.forecaster_id = f.id
           LEFT JOIN source s ON c.source_id = s.id
           LEFT JOIN outcome o ON c.id = o.claim_id
           WHERE c.id = $1`,
          [id]
        );

        if (claimResult.rows.length === 0) {
          reply.code(404).send({ error: 'Claim not found' });
          return;
        }

        const claim = claimResult.rows[0];

        // Get tags
        const tagsResult = await query(
          `SELECT tag, tag_type FROM claim_tag WHERE claim_id = $1`,
          [id]
        );
        claim.tags = tagsResult.rows;

        reply.send(claim);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch claim' });
      }
    }
  );

  // GET /v1/claims - List claims with filters
  fastify.get(
    '/',
    async (
      request: FastifyRequest<{
        Querystring: {
          domain?: string;
          status?: string;
          forecaster_id?: string;
          limit?: string;
          offset?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { domain, status, forecaster_id, limit = '50', offset = '0' } = request.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (domain) {
          whereClause += ` AND c.domain = $${paramIndex}`;
          params.push(domain);
          paramIndex++;
        }

        if (status) {
          whereClause += ` AND c.status = $${paramIndex}`;
          params.push(status);
          paramIndex++;
        }

        if (forecaster_id) {
          whereClause += ` AND c.forecaster_id = $${paramIndex}`;
          params.push(forecaster_id);
          paramIndex++;
        }

        params.push(parseInt(limit, 10));
        params.push(parseInt(offset, 10));

        const claimsResult = await query(
          `SELECT c.*, 
                  f.name as forecaster_name, f.username as forecaster_username,
                  s.url as source_url,
                  o.perimeter_score
           FROM claim c
           LEFT JOIN forecaster f ON c.forecaster_id = f.id
           LEFT JOIN source s ON c.source_id = s.id
           LEFT JOIN outcome o ON c.id = o.claim_id
           ${whereClause}
           ORDER BY c.created_at DESC
           LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
          params
        );

        reply.send({ claims: claimsResult.rows, count: claimsResult.rows.length });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch claims' });
      }
    }
  );

  // POST /v1/claims/:id/resolve - Resolve a claim with outcome
  fastify.post(
    '/:id/resolve',
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: ResolveClaimRequest;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const body = resolveClaimSchema.parse(request.body);

        // Get the claim
        const claimResult = await query(`SELECT * FROM claim WHERE id = $1`, [id]);

        if (claimResult.rows.length === 0) {
          reply.code(404).send({ error: 'Claim not found' });
          return;
        }

        const claim: Claim = claimResult.rows[0] as any;

        // Check if already resolved
        const existingOutcome = await query(`SELECT * FROM outcome WHERE claim_id = $1`, [id]);

        if (existingOutcome.rows.length > 0) {
          reply.code(400).send({ error: 'Claim already resolved' });
          return;
        }

        // Create outcome
        const outcome: Outcome = {
          id: '',
          claim_id: id,
          actual_value: body.actual_value,
          actual_category: body.actual_category,
          actual_probability: body.actual_probability,
          perimeter_score: 0, // Will be calculated
          data_source: body.data_source,
          verified_at: new Date(),
          created_at: new Date(),
        };

        // Calculate Perimeter score
        try {
          outcome.perimeter_score = PerimeterCalculator.calculate(claim, outcome);
        } catch (error: any) {
          reply.code(400).send({ error: 'Failed to calculate Perimeter score', details: error.message });
          return;
        }

        // Insert outcome
        const outcomeResult = await query(
          `INSERT INTO outcome (
            claim_id, actual_value, actual_category, actual_probability,
            perimeter_score, data_source, verified_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            outcome.claim_id,
            outcome.actual_value || null,
            outcome.actual_category || null,
            outcome.actual_probability || null,
            outcome.perimeter_score,
            outcome.data_source || null,
            outcome.verified_at,
          ]
        );

        // Update claim status
        await query(`UPDATE claim SET status = 'resolved' WHERE id = $1`, [id]);

        reply.code(201).send(outcomeResult.rows[0]);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          reply.code(400).send({ error: 'Validation error', details: error.errors });
        } else {
          fastify.log.error(error);
          reply.code(500).send({ error: 'Failed to resolve claim' });
        }
      }
    }
  );
}

