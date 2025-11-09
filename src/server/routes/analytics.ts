import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { query } from '../../db/connection';

export async function analyticsRoutes(fastify: FastifyInstance) {
  // GET /v1/analytics - Get analytics and statistics
  fastify.get(
    '/',
    async (
      request: FastifyRequest<{
        Querystring: {
          domain?: string;
          period?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { domain, period } = request.query;

        // Calculate date filter based on period
        let dateFilter = '';
        if (period) {
          const periods: Record<string, number> = {
            '1y': 365,
            '6m': 180,
            '3m': 90,
            '1m': 30,
            '7d': 7,
          };
          const days = periods[period] || 365;
          dateFilter = `AND c.created_at >= NOW() - INTERVAL '${days} days'`;
        }

        const domainFilter = domain ? `AND c.domain = '${domain}'` : '';

        // Total claims
        const totalResult = await query(
          `SELECT COUNT(*) as count FROM claim c WHERE 1=1 ${domainFilter} ${dateFilter}`
        );
        const totalClaims = parseInt(totalResult.rows[0].count, 10);

        // Resolved claims
        const resolvedResult = await query(
          `SELECT COUNT(*) as count FROM claim c 
           WHERE c.status = 'resolved' ${domainFilter} ${dateFilter}`
        );
        const resolvedClaims = parseInt(resolvedResult.rows[0].count, 10);

        // Pending claims
        const pendingResult = await query(
          `SELECT COUNT(*) as count FROM claim c 
           WHERE c.status = 'pending' ${domainFilter} ${dateFilter}`
        );
        const pendingClaims = parseInt(pendingResult.rows[0].count, 10);

        // Average perimeter
        const avgPerimeterResult = await query(
          `SELECT AVG(o.perimeter_score) as avg_perimeter
           FROM outcome o
           INNER JOIN claim c ON o.claim_id = c.id
           WHERE c.status = 'resolved' ${domainFilter} ${dateFilter}`
        );
        const averagePerimeter = parseFloat(
          avgPerimeterResult.rows[0]?.avg_perimeter || '0'
        );

        // Domain breakdown
        const domainBreakdownResult = await query(
          `SELECT c.domain, COUNT(*) as count
           FROM claim c
           WHERE 1=1 ${dateFilter}
           GROUP BY c.domain`
        );
        const domainBreakdown: Record<string, number> = {};
        domainBreakdownResult.rows.forEach((row) => {
          domainBreakdown[row.domain] = parseInt(row.count, 10);
        });

        // Type breakdown
        const typeBreakdownResult = await query(
          `SELECT c.claim_type, COUNT(*) as count
           FROM claim c
           WHERE 1=1 ${domainFilter} ${dateFilter}
           GROUP BY c.claim_type`
        );
        const typeBreakdown: Record<string, number> = {};
        typeBreakdownResult.rows.forEach((row) => {
          typeBreakdown[row.claim_type] = parseInt(row.count, 10);
        });

        // Status breakdown
        const statusBreakdownResult = await query(
          `SELECT c.status, COUNT(*) as count
           FROM claim c
           WHERE 1=1 ${domainFilter} ${dateFilter}
           GROUP BY c.status`
        );
        const statusBreakdown: Record<string, number> = {};
        statusBreakdownResult.rows.forEach((row) => {
          statusBreakdown[row.status] = parseInt(row.count, 10);
        });

        // Perimeter distribution
        const perimeterDistResult = await query(
          `SELECT 
             COUNT(CASE WHEN o.perimeter_score >= 80 THEN 1 END) as excellent,
             COUNT(CASE WHEN o.perimeter_score >= 60 AND o.perimeter_score < 80 THEN 1 END) as good,
             COUNT(CASE WHEN o.perimeter_score >= 40 AND o.perimeter_score < 60 THEN 1 END) as fair,
             COUNT(CASE WHEN o.perimeter_score < 40 THEN 1 END) as poor
           FROM outcome o
           INNER JOIN claim c ON o.claim_id = c.id
           WHERE c.status = 'resolved' ${domainFilter} ${dateFilter}`
        );
        const perimeterDistribution = perimeterDistResult.rows[0] || {
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0,
        };

        // Recent activity (last 7 days)
        const recentActivityResult = await query(
          `SELECT 
             COUNT(CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as claims,
             COUNT(CASE WHEN c.updated_at >= NOW() - INTERVAL '7 days' AND c.status = 'resolved' THEN 1 END) as resolutions
           FROM claim c
           WHERE 1=1 ${domainFilter}`
        );
        const recentActivity = recentActivityResult.rows[0] || {
          claims: 0,
          resolutions: 0,
        };

        reply.send({
          totalClaims: totalClaims,
          resolvedClaims: resolvedClaims,
          pendingClaims: pendingClaims,
          averagePerimeter: averagePerimeter,
          domainBreakdown,
          typeBreakdown,
          statusBreakdown,
          perimeterDistribution: {
            excellent: parseInt(perimeterDistribution.excellent, 10),
            good: parseInt(perimeterDistribution.good, 10),
            fair: parseInt(perimeterDistribution.fair, 10),
            poor: parseInt(perimeterDistribution.poor, 10),
          },
          recentActivity: {
            claims: parseInt(recentActivity.claims, 10),
            resolutions: parseInt(recentActivity.resolutions, 10),
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch analytics' });
      }
    }
  );

  // GET /v1/analytics/trends - Get trend data
  fastify.get(
    '/trends',
    async (
      request: FastifyRequest<{
        Querystring: {
          days?: string;
          domain?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const days = parseInt(request.query.days || '30', 10);
        const domainFilter = request.query.domain
          ? `AND c.domain = '${request.query.domain}'`
          : '';

        const trendResult = await query(
          `SELECT 
             DATE(c.created_at) as date,
             COUNT(*) as claims,
             COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved,
             AVG(CASE WHEN c.status = 'resolved' THEN o.perimeter_score END) as avg_perimeter
           FROM claim c
           LEFT JOIN outcome o ON c.id = o.claim_id
           WHERE c.created_at >= NOW() - INTERVAL '${days} days' ${domainFilter}
           GROUP BY DATE(c.created_at)
           ORDER BY date ASC`
        );

        reply.send({
          trends: trendResult.rows.map((row) => ({
            date: row.date,
            claims: parseInt(row.claims, 10),
            resolved: parseInt(row.resolved, 10),
            averagePerimeter: parseFloat(row.avg_perimeter || '0'),
          })),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Failed to fetch trends' });
      }
    }
  );
}

