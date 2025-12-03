// Get turn-by-turn driving directions between two locations
// Like Google Maps directions: "Turn left, go straight, etc."

/**
 * Get driving directions from point A to point B
 * Example: Get directions from "Your Location" to "Paoay Church"
 * 
 * @param {Object} from - Starting point {latitude, longitude, title}
 * @param {Object} to - Ending point {latitude, longitude, title}
 * @returns {Promise<Object|null>} - Route data with map line and instructions
 */
export async function getRouteDirections(from, to) {
  // Step 1: Get Mapbox API key from environment variables
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    console.error('Mapbox API key is missing');
    return null;
  }

  // Step 2: Build the coordinates string for the API
  // Format: "longitude,latitude;longitude,latitude"
  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  
  // Step 3: Build the full API URL with all options
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&access_token=${token}`;

  try {
    // Step 4: Ask Mapbox for directions
    const response = await fetch(url);
    const data = await response.json();

    // Step 5: Check if we got valid route data
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      const leg = route.legs[0]; // The journey from A to B

      // Step 6: Return the useful information
      return {
        geometry: route.geometry,    // The line to draw on the map
        steps: leg.steps,            // Turn-by-turn instructions
        distance: route.distance,    // Total distance in meters
        duration: route.duration,    // Total time in seconds
        from: from.title,            // Starting place name
        to: to.title,                // Ending place name
      };
    }

    return null; // No route found
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
}

/**
 * Format one step of directions into readable text
 * Example: "Turn left onto Main Street" → "Turn left onto Main Street (2.5 km)"
 * 
 * @param {Object} step - One step from the directions
 * @returns {string} - Readable instruction with distance
 */
export function formatStepInstruction(step) {
  // Get the instruction text (e.g., "Turn left")
  const instruction = step.maneuver.instruction;
  
  // Convert distance from meters to kilometers
  const distanceKm = (step.distance / 1000).toFixed(2);
  
  // Combine instruction with distance
  return `${instruction} (${distanceKm} km)`;
}

/**
 * Calculate total distance and time for the entire route
 * Adds up all individual steps to get the complete journey info
 * 
 * @param {Array} steps - List of all direction steps
 * @returns {Object} - {distance: total meters, duration: total seconds}
 */
export function getTotalRouteInfo(steps) {
  // Check if we have any steps
  if (!steps || steps.length === 0) {
    return { distance: 0, duration: 0 };
  }

  // Add up distances from all steps
  // Example: step1: 500m + step2: 1000m + step3: 300m = 1800m total
  const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0);
  
  // Add up durations from all steps
  // Example: step1: 60s + step2: 120s + step3: 30s = 210s total
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  return {
    distance: totalDistance,  // Total meters
    duration: totalDuration,  // Total seconds
  };
}

/**
 * Convert meters to km or m (whichever is more readable)
 * Examples: 
 *   - 5420 meters → "5.42 km"
 *   - 850 meters → "850 m"
 * 
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} - Human-readable distance
 */
export function formatDistance(distanceInMeters) {
  // If no distance, show 0
  if (!distanceInMeters) return '0 km';
  
  // Convert to kilometers
  const kilometers = distanceInMeters / 1000;
  
  // If less than 1 km, show in meters instead (easier to read)
  if (kilometers < 1) {
    return `${Math.round(distanceInMeters)} m`;
  }
  
  // Otherwise show in kilometers with 2 decimal places
  return `${kilometers.toFixed(2)} km`;
}

/**
 * Convert seconds to readable time format
 * Examples: 
 *   - 1500 seconds → "25 min"
 *   - 5400 seconds → "1h 30min"
 *   - 3600 seconds → "1h"
 * 
 * @param {number} durationInSeconds - Time in seconds
 * @returns {string} - Human-readable time
 */
export function formatDuration(durationInSeconds) {
  // If no time, show 0
  if (!durationInSeconds) return '0 min';
  
  // Convert seconds to minutes (60 seconds = 1 minute)
  const totalMinutes = Math.round(durationInSeconds / 60);
  
  // If less than 1 hour, just show minutes
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  
  // If 1 hour or more, calculate hours and leftover minutes
  const hours = Math.floor(totalMinutes / 60);        // Full hours
  const leftoverMinutes = totalMinutes % 60;          // Remaining minutes
  
  // If exactly on the hour (no extra minutes)
  if (leftoverMinutes === 0) {
    return `${hours}h`;
  }
  
  // Show both hours and minutes
  return `${hours}h ${leftoverMinutes}min`;
}

/**
 * Choose the right icon for each turn instruction
 * Example: If instruction says "turn left" → return "turn-left" icon
 * 
 * @param {Object} maneuver - The turn information from directions
 * @returns {string} - Name of the icon to show
 */
export function getManeuverIcon(maneuver) {
  const type = maneuver.type;         // What kind of action? (turn, merge, etc.)
  const modifier = maneuver.modifier; // Which direction? (left, right, etc.)

  // Handle turning maneuvers
  if (type === 'turn') {
    // Check if it's any type of left turn
    if (modifier === 'left' || modifier === 'slight left' || modifier === 'sharp left') {
      return 'turn-left';
    }
    // Check if it's any type of right turn
    if (modifier === 'right' || modifier === 'slight right' || modifier === 'sharp right') {
      return 'turn-right';
    }
  }
  
  // Handle other types of maneuvers
  if (type === 'depart') return 'depart';        // Starting the journey
  if (type === 'arrive') return 'arrive';        // Reached destination
  if (type === 'merge') return 'merge';          // Merging onto road
  if (type === 'roundabout') return 'roundabout'; // Going through roundabout
  if (type === 'rotary') return 'roundabout';    // Another type of roundabout
  if (type === 'continue') return 'straight';    // Keep going straight
  
  // Default: straight ahead
  return 'straight';
}

