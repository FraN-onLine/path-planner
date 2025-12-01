// Uniform Cost Search Utility
// Sorts destinations by closest distance from user location

/**
 * Sort destinations by distance from user location (closest first)
 * @param {Array} destinations - Array of destination objects
 * @param {Object} userDistances - User distances object from user-distances.json
 * @returns {Array} - Sorted array of destinations (closest first)
 */
export function sortByClosestDistance(destinations, userDistances) {
  if (!destinations || destinations.length === 0) {
    return [];
  }

  if (!userDistances || !userDistances.distances) {
    console.warn('User distances not available, returning original order');
    return [...destinations];
  }

  // Create a copy and sort by distance
  const sorted = [...destinations].sort((a, b) => {
    const distA = userDistances.distances[a.title];
    const distB = userDistances.distances[b.title];

    // Handle missing distances
    if (!distA || distA.distance === null) return 1;
    if (!distB || distB.distance === null) return -1;

    // Sort by distance (ascending - closest first)
    return distA.distance - distB.distance;
  });

  return sorted;
}

/**
 * Get distance from user to a specific destination
 * @param {string} destinationTitle - Title of the destination
 * @param {Object} userDistances - User distances object from user-distances.json
 * @returns {Object|null} - Distance object {distance, duration} or null
 */
export function getDistanceToDestination(destinationTitle, userDistances) {
  if (!userDistances || !userDistances.distances) {
    return null;
  }

  return userDistances.distances[destinationTitle] || null;
}

/**
 * Format distance in km
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} - Formatted distance string (e.g., "5.42 km")
 */
export function formatDistance(distanceInMeters) {
  if (!distanceInMeters || distanceInMeters === null) {
    return 'N/A';
  }

  const km = distanceInMeters / 1000;
  return `${km.toFixed(2)} km`;
}

/**
 * Format duration in minutes or hours
 * @param {number} durationInSeconds - Duration in seconds
 * @returns {string} - Formatted duration string (e.g., "25 min" or "1h 30min")
 */
export function formatDuration(durationInSeconds) {
  if (!durationInSeconds || durationInSeconds === null) {
    return 'N/A';
  }

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
 * Get closest N destinations from user location
 * @param {Array} destinations - Array of destination objects
 * @param {Object} userDistances - User distances object
 * @param {number} limit - Number of closest destinations to return
 * @returns {Array} - Array of closest destinations
 */
export function getClosestDestinations(destinations, userDistances, limit = 5) {
  const sorted = sortByClosestDistance(destinations, userDistances);
  return sorted.slice(0, limit);
}

