export default function handler(_req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    time: new Date().toISOString(),
  });
}
