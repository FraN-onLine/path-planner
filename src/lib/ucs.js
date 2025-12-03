// Uniform Cost Search (UCS) - Finds the shortest path by sorting destinations by distance
// This helps tourists visit places in the most efficient order

/**
 * Sort destinations by distance from user location (closest first)
 * Think of this like: "Which tourist spot is nearest to me right now?"
 * 
 * @param {Array} destinations - List of tourist destinations
 * @param {Object} userDistances - Pre-calculated distances from user to each destination
 * @returns {Array} - List sorted from closest to farthest
 */
export function sortByClosestDistance(destinations, userDistances) {
  // Sort destinations by distance (closest first)
  const sorted = [...destinations].sort((placeA, placeB) => {
    // Get distance info for both places
    const distanceToA = userDistances.distances[placeA.title];
    const distanceToB = userDistances.distances[placeB.title];

    // Compare distances: smaller number = closer = comes first
    // Example: 5km - 10km = -5 (negative means A comes before B)
    return distanceToA.distance - distanceToB.distance;
  });

  return sorted;
}

/**
 * Get distance info for one specific destination
 * Example: "How far is Paoay Church from me?"
 * 
 * @param {string} destinationTitle - Name of the place (e.g., "Paoay Church")
 * @param {Object} userDistances - All distance data
 * @returns {Object|null} - {distance: 5000, duration: 300} or null if not found
 */
export function getDistanceToDestination(destinationTitle, userDistances) {
  // Look up the destination and return its distance info
  return userDistances.distances[destinationTitle] || null;
}

/**
 * Convert meters to a readable format
 * Example: 5420 meters → "5.42 km"
 * 
 * @param {number} distanceInMeters - Distance in meters (e.g., 5420)
 * @returns {string} - Human-readable text (e.g., "5.42 km")
 */
export function formatDistance(distanceInMeters) {
  // Convert meters to kilometers (1000 meters = 1 km)
  const kilometers = distanceInMeters / 1000;
  
  // Format to 2 decimal places (e.g., 5.42 km)
  return `${kilometers.toFixed(2)} km`;
}

/**
 * Convert seconds to a readable time format
 * Examples: 
 *   - 1500 seconds → "25 min"
 *   - 5400 seconds → "1h 30min"
 * 
 * @param {number} durationInSeconds - Time in seconds (e.g., 1500)
 * @returns {string} - Human-readable text (e.g., "25 min")
 */
export function formatDuration(durationInSeconds) {
  // Convert seconds to minutes (60 seconds = 1 minute)
  const totalMinutes = Math.round(durationInSeconds / 60);
  
  // If less than 1 hour, just show minutes
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  // If 1 hour or more, show hours and minutes
  const hours = Math.floor(totalMinutes / 60); // Full hours
  const minutes = totalMinutes % 60; // Leftover minutes
  
  // If exactly on the hour (no extra minutes)
  if (minutes === 0) {
    return `${hours}h`;
  }

  // Show both hours and minutes
  return `${hours}h ${minutes}min`;
}

/**
 * Get only the top N closest destinations
 * Example: "Show me the 5 nearest tourist spots"
 * 
 * @param {Array} destinations - All tourist destinations
 * @param {Object} userDistances - Distance data
 * @param {number} limit - How many places to return (default: 5)
 * @returns {Array} - Top N closest destinations
 */
export function getClosestDestinations(destinations, userDistances, limit = 5) {
  // Sort all destinations by distance
  const sorted = sortByClosestDistance(destinations, userDistances);
  
  // Take only the first N items (the closest ones)
  // Example: If limit = 5, get the 5 closest places
  return sorted.slice(0, limit);
}

