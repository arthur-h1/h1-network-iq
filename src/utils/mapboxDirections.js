// Mapbox Directions API utilities
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXJ0aHVyaDEiLCJhIjoiY21raDJmb2cyMGVzYjNmcW1kOWRmbGJqbyJ9.K5fViocsPVuK_22SwWc4Lg';

/**
 * Calculate driving distance and time between two points using Mapbox Directions API
 * @param {Object} origin - Origin coordinates { lng, lat }
 * @param {Object} destination - Destination coordinates { lng, lat }
 * @returns {Promise<Object>} - { distance (meters), duration (seconds), route (geometry) }
 */
export async function calculateDrivingDistance(origin, destination) {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        durationMinutes: Math.round(route.duration / 60), // in minutes
        distanceMiles: (route.distance * 0.000621371).toFixed(1), // in miles
        geometry: route.geometry, // GeoJSON LineString for drawing route
      };
    }

    throw new Error('No route found');
  } catch (error) {
    console.error('Error calculating driving distance:', error);
    throw error;
  }
}

/**
 * Calculate driving distances from one origin to multiple destinations
 * @param {Object} origin - Origin coordinates { lng, lat }
 * @param {Array<Object>} destinations - Array of destination coordinates [{ lng, lat, id }, ...]
 * @param {number} maxDestinations - Maximum number of destinations per request (Mapbox limit is 25)
 * @returns {Promise<Array>} - Array of results with destination IDs and distances
 */
export async function calculateMultipleDistances(origin, destinations, maxDestinations = 12) {
  // Mapbox allows up to 25 coordinates total (1 origin + 24 destinations)
  // We'll use 12 to be safe and allow for faster responses
  const results = [];

  for (let i = 0; i < destinations.length; i += maxDestinations) {
    const batch = destinations.slice(i, i + maxDestinations);

    // Build coordinates string: origin;dest1;dest2;...
    const coords = [
      `${origin.lng},${origin.lat}`,
      ...batch.map(dest => `${dest.lng},${dest.lat}`)
    ].join(';');

    try {
      const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}?sources=0&annotations=distance,duration&access_token=${MAPBOX_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.distances && data.distances[0]) {
        batch.forEach((dest, idx) => {
          const distance = data.distances[0][idx + 1]; // +1 because source is index 0
          const duration = data.durations[0][idx + 1];

          if (distance !== null && duration !== null) {
            results.push({
              id: dest.id,
              ...dest,
              distance, // meters
              duration, // seconds
              durationMinutes: Math.round(duration / 60),
              distanceMiles: (distance * 0.000621371).toFixed(1),
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in batch distance calculation:', error);
    }
  }

  return results;
}

/**
 * Get isochrone (areas reachable within certain drive times)
 * @param {Object} origin - Origin coordinates { lng, lat }
 * @param {Array<number>} contours - Drive times in minutes (e.g., [5, 10, 15])
 * @returns {Promise<Object>} - GeoJSON FeatureCollection of isochrone polygons
 */
export async function getIsochrone(origin, contours = [5, 10, 15]) {
  try {
    const contoursParam = contours.join(',');
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${origin.lng},${origin.lat}?contours_minutes=${contoursParam}&polygons=true&access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    return data; // Returns GeoJSON FeatureCollection
  } catch (error) {
    console.error('Error fetching isochrone:', error);
    throw error;
  }
}
