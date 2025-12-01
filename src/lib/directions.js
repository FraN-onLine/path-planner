// Mapbox Directions API utilities for turn-by-turn navigation

/**
 * Fetch route with geometry and turn-by-turn directions
 * @param {Object} from - Starting location {latitude, longitude, title}
 * @param {Object} to - Destination location {latitude, longitude, title}
 * @returns {Promise<Object|null>} Route data with geometry and steps
 */
export async function getRouteDirections(from, to) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    console.error('Mapbox token is not set');
    return null;
  }

  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&access_token=${token}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        geometry: route.geometry, // GeoJSON LineString
        steps: leg.steps, // Turn-by-turn instructions
        distance: route.distance, // Total distance in meters
        duration: route.duration, // Total duration in seconds
        from: from.title,
        to: to.title,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
}

/**
 * Format a single step instruction
 * @param {Object} step - Step object from Mapbox Directions API
 * @returns {string} Formatted instruction
 */
export function formatStepInstruction(step) {
  const maneuver = step.maneuver;
  const distance = (step.distance / 1000).toFixed(2);
  return `${maneuver.instruction} (${distance} km)`;
}

/**
 * Get total route information summary
 * @param {Array} steps - Array of step objects
 * @returns {Object} Total distance and duration
 */
export function getTotalRouteInfo(steps) {
  if (!steps || steps.length === 0) {
    return { distance: 0, duration: 0 };
  }

  const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0);
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  return {
    distance: totalDistance,
    duration: totalDuration,
  };
}

/**
 * Format distance in km
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} Formatted distance
 */
export function formatDistance(distanceInMeters) {
  if (!distanceInMeters) return '0 km';
  
  const km = distanceInMeters / 1000;
  if (km < 1) {
    return `${Math.round(distanceInMeters)} m`;
  }
  return `${km.toFixed(2)} km`;
}

/**
 * Format duration in minutes or hours
 * @param {number} durationInSeconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(durationInSeconds) {
  if (!durationInSeconds) return '0 min';
  
  const minutes = Math.round(durationInSeconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Get icon name for maneuver type
 * @param {Object} maneuver - Maneuver object from step
 * @returns {string} Icon identifier
 */
export function getManeuverIcon(maneuver) {
  const type = maneuver.type;
  const modifier = maneuver.modifier;

  // Map maneuver types to icon names
  if (type === 'turn') {
    if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left') {
      return 'turn-left';
    }
    if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right') {
      return 'turn-right';
    }
  }
  
  if (type === 'depart') return 'depart';
  if (type === 'arrive') return 'arrive';
  if (type === 'merge') return 'merge';
  if (type === 'roundabout') return 'roundabout';
  if (type === 'rotary') return 'roundabout';
  if (type === 'continue') return 'straight';
  
  return 'straight';
}

