import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { pool } from '../../db/connection';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connection
      await pool.query('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  });
}

