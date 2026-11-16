import http from 'node:http';
import { SwarmService } from './service/SwarmService.js';

export * from './domain/types.js';
export * from './service/SwarmService.js';

const swarm = new SwarmService();
const PORT = Number(process.env.PORT) || 8081;

export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'UP', service: 'oenexa-agents', timestamp: new Date().toISOString() }));
  }

  if (req.url === '/api/agents' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: swarm.getAgents() }));
  }

  if (req.url === '/api/tasks' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: swarm.getTasks() }));
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[oenexa-agents] Swarm Agent HTTP Microservice listening on port ${PORT}`);
  });
}
