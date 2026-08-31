export interface PlaceItem {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country: string;
  displayName: string;
  lat?: number;
  lng?: number;
}

const memoryCache: Record<string, PlaceItem[]> = {};

/**
 * Searches worldwide cities and places using free OpenStreetMap Photon & Nominatim APIs
 */
export async function searchPlaces(query: string): Promise<PlaceItem[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  const results: PlaceItem[] = [];

  // 1. Primary: Photon (Fast, high-limit OpenStreetMap geocoder)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=10`;
    const res = await fetch(photonUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.features)) {
        for (const feat of data.features) {
          const p = feat.properties || {};
          const name = p.name || p.city || '';
          const city = p.city || (p.type === 'city' ? p.name : '');
          const state = p.state || p.county || '';
          const country = p.country || '';
          const lat = feat.geometry?.coordinates?.[1];
          const lng = feat.geometry?.coordinates?.[0];

          // Build clean location string (e.g., "Mumbai, Maharashtra, India")
          const parts = [name !== city ? name : '', city, state, country].filter(Boolean);
          const uniqueParts = Array.from(new Set(parts));
          const displayName = uniqueParts.join(', ');

          if (displayName && country) {
            results.push({
              id: `photon_${p.osm_id || Math.random()}`,
              name: name || city || displayName,
              city,
              state,
              country,
              displayName,
              lat,
              lng,
            });
          }
        }
      }
    }
  } catch (err) {
    // Silent catch, try fallback
  }

  // 2. Fallback: Nominatim if Photon yielded few results
  if (results.length === 0) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=8&addressdetails=1`;
      const res = await fetch(nominatimUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AstroAi4u-App/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality || item.name || '';
            const state = addr.state || addr.region || '';
            const country = addr.country || '';
            const parts = [city, state, country].filter(Boolean);
            const displayName = Array.from(new Set(parts)).join(', ') || item.display_name;

            results.push({
              id: `nom_${item.place_id || Math.random()}`,
              name: city || item.name,
              city,
              state,
              country,
              displayName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            });
          }
        }
      }
    } catch (e) {
      // Fallback failed
    }
  }

  // Deduplicate by displayName
  const seen = new Set<string>();
  const filtered = results.filter(item => {
    const key = item.displayName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  memoryCache[cacheKey] = filtered;
  return filtered;
}
