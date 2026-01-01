/**
 * CDEK API Integration
 * Fetches real pickup points from CDEK API
 * 
 * Endpoints:
 * GET /api/cdek?action=token - Get auth token
 * GET /api/cdek?action=points&city=44 - Get pickup points by city code
 * GET /api/cdek?action=cities&query=Москва - Search cities
 * GET /api/cdek?action=calculate&from=44&to=137&weight=1000 - Calculate delivery
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.CDEK_CLIENT_ID;
  const clientSecret = process.env.CDEK_CLIENT_SECRET;
  const isTestMode = process.env.CDEK_TEST_MODE === 'true';

  // Use test credentials if not configured
  const effectiveClientId = clientId || 'EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI';
  const effectiveClientSecret = clientSecret || 'PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3dG';
  
  const baseUrl = isTestMode 
    ? 'https://api.edu.cdek.ru/v2'
    : 'https://api.cdek.ru/v2';

  try {
    const { action, city, query, from, to, weight, lat, lng } = req.query;

    // Get OAuth token
    const getToken = async () => {
      const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: effectiveClientId,
          client_secret: effectiveClientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get CDEK token');
      }

      const data = await tokenResponse.json();
      return data.access_token;
    };

    switch (action) {
      case 'token': {
        const token = await getToken();
        return res.json({ success: true, token, testMode: isTestMode });
      }

      case 'points': {
        const token = await getToken();
        
        let url = `${baseUrl}/deliverypoints?type=PVZ,POSTAMAT`;
        
        if (city) {
          url += `&city_code=${city}`;
        }
        
        // If lat/lng provided, search by coordinates
        if (lat && lng) {
          url += `&latitude=${lat}&longitude=${lng}&radius=30`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('CDEK points error:', error);
          return res.status(response.status).json({ error: 'Failed to fetch points' });
        }

        const points = await response.json();

        // Transform to our format
        const formattedPoints = points.map(point => ({
          id: point.code,
          serviceId: 'cdek',
          name: point.name || `СДЭК ${point.code}`,
          address: point.location?.address_full || point.location?.address,
          lat: point.location?.latitude,
          lng: point.location?.longitude,
          workHours: point.work_time || '09:00-21:00',
          phone: point.phones?.[0]?.number || null,
          hasCard: point.have_cashless || false,
          hasFitting: point.is_dressing_room || false,
          type: point.type, // PVZ or POSTAMAT
          dimensions: point.dimensions,
          nearestStation: point.nearest_station,
          nearestMetroStation: point.nearest_metro_station,
        }));

        return res.json({
          success: true,
          count: formattedPoints.length,
          points: formattedPoints,
        });
      }

      case 'cities': {
        const token = await getToken();
        
        const url = `${baseUrl}/location/cities?city=${encodeURIComponent(query || '')}&size=20`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to search cities' });
        }

        const cities = await response.json();

        return res.json({
          success: true,
          cities: cities.map(city => ({
            code: city.code,
            name: city.city,
            region: city.region,
            country: city.country,
            fullName: `${city.city}, ${city.region}`,
          })),
        });
      }

      case 'calculate': {
        if (!from || !to) {
          return res.status(400).json({ error: 'Missing from or to city codes' });
        }

        const token = await getToken();
        
        const calcResponse = await fetch(`${baseUrl}/calculator/tariff`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 1, // "интернет-магазин - клиент"
            from_location: { code: parseInt(from) },
            to_location: { code: parseInt(to) },
            packages: [{
              weight: parseInt(weight) || 1000, // grams
              length: 30,
              width: 20,
              height: 10,
            }],
          }),
        });

        if (!calcResponse.ok) {
          const error = await calcResponse.text();
          console.error('CDEK calc error:', error);
          return res.status(calcResponse.status).json({ error: 'Failed to calculate' });
        }

        const calculation = await calcResponse.json();

        // Find relevant tariffs
        const tariffs = calculation.tariff_codes?.map(tariff => ({
          code: tariff.tariff_code,
          name: tariff.tariff_name,
          description: tariff.tariff_description,
          price: tariff.delivery_sum,
          minDays: tariff.period_min,
          maxDays: tariff.period_max,
        })) || [];

        return res.json({
          success: true,
          currency: calculation.currency,
          tariffs,
        });
      }

      default:
        return res.status(400).json({ 
          error: 'Unknown action',
          availableActions: ['token', 'points', 'cities', 'calculate'],
        });
    }

  } catch (error) {
    console.error('CDEK API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
