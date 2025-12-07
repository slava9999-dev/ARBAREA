import { applyCors } from './_cors.js';

export default function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return;

  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    time: new Date().toISOString(),
  });
}
