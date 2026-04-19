const axios = require('axios');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Nominatim requires a real User-Agent per their policy
const USER_AGENT = 'RentUp-Property-App/1.0 (contact@rentup.local)';

async function geocodeLocation(query) {
  if (!query || typeof query !== 'string') return null;
  try {
    const { data } = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'in',
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
      timeout: 6000,
    });
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return { lat: latNum, lng: lngNum };
      }
    }
  } catch (err) {
    console.warn('Geocode failed for:', query, err.message);
  }
  return null;
}

module.exports = { geocodeLocation };
