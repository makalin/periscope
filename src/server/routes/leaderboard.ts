import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../db/connection';
import { LeaderboardQuery, LeaderboardEntry } from '../../types';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  // GET /v1/leaderboard - Get leaderboard
  fastify.get(
    '/',
    async (
      request: FastifyRequest<{
        Querystring: LeaderboardQuery;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { domain, period, min_claims = 1, limit = 100 } = request.query;

        // Calculate date filter based on period
        let dateFilter = '';
        if (period) {
          const periods: Record<string, number> = {
            '1y': 365,
            '6m': 180,
            '3m': 90,
            '1m': 30,
          };
          const days = periods[period] || 365;
          dateFilter = `AND c.created_at >= NOW() - INTERVAL '${days} days'`;
        }

        // Build domain filter
        const domainFilter = domain ? `AND c.domain = '${domain}'` : '';

        const leaderboardQuery = `
          SELECT 
            f.id as forecaster_id,
            f.name as forecaster_name,
            f.username as forecaster_username,
            COUNT(DISTINCT c.id) as total_claims,
            COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_claims,
            AVG(o.perimeter_score) as average_perimeter,
            SUM(o.perimeter_score) / NULLIF(COUNT(o.id), 0) as weighted_perimeter
          FROM forecaster f
          INNER JOIN claim c ON f.id = c.forecaster_id
          LEFT JOIN outcome o ON c.id = o.claim_id
          WHERE c.status = 'resolved'
            ${domainFilter}
            ${dateFilter}
          GROUP BY f.id, f.name, f.username
          HAVING COUNT(DISTINCT c.id) >= $1
          ORDER BY weighted_perimeter DESC NULLS LAST, average_perimeter DESC NULLS LAST
          LIMIT $2
        `;

        const result = await query(leaderboardQuery, [min_claims, limit]);

        const leaderboard: LeaderboardEntry[] = result.rows.map((row) => ({
          forecaster_id: row.forecaster_id,
          forecaster_name: row.forecaster_name,
          forecaster_username: row.forecaster_username,
          total_claims: parseInt(row.total_claims, 10),
          resolved_claims: parseInt(row.resolved_claims, 10),
          average_perimeter: parseFloat(row.average_perimeter || '0'),
          weighted_perimeter: parseFloat(row.weighted_perimeter || '0'),
        }));

        reply.send({ leaderboard, count: leaderboard.length });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch leaderboard' });
      }
    }
  );
}

