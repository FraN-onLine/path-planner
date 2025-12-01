const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local file manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

// Read locations from JSON file
const locationsPath = path.join(__dirname, '../src/data/locations.json');
const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Get Mapbox token from command line argument or environment
const MAPBOX_TOKEN = process.argv[2] || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('Error: Mapbox token not provided');
  console.error('Usage: npm run generate-user-distances -- YOUR_MAPBOX_TOKEN');
  console.error('Or set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local file');
  process.exit(1);
}

// User location (CCIS)
const userLocation = {
  title: "Your Location (CCIS)",
  latitude: 18.059779,
  longitude: 120.545021
};

console.log(`Calculating distances from user location to ${locations.length} destinations...`);
console.log(`User location: ${userLocation.latitude}, ${userLocation.longitude}\n`);

// Function to make API request and return a promise
function fetchMatrix(coordinates) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}?annotations=distance,duration&access_token=${MAPBOX_TOKEN}`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.code !== 'Ok') {
            reject(new Error(response.message || response.code));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to calculate distance from user to a destination
async function calculateDistance(userCoord, destCoord) {
  const coordinates = `${userCoord};${destCoord}`;
  try {
    const response = await fetchMatrix(coordinates);
    return {
      distance: response.distances[0][1],
      duration: response.durations[0][1]
    };
  } catch (error) {
    console.error(`Error calculating distance: ${error.message}`);
    return { distance: null, duration: null };
  }
}

// Main function to build user distances
async function buildUserDistances() {
  const distances = {};
  const userCoord = `${userLocation.longitude},${userLocation.latitude}`;
  
  let completed = 0;
  const total = locations.length;
  
  console.log('Calculating distances...\n');
  
  // Calculate distance from user to each destination
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const destCoord = `${location.longitude},${location.latitude}`;
    
    const result = await calculateDistance(userCoord, destCoord);
    
    if (result.distance !== null) {
      distances[location.title] = result;
      console.log(`✓ ${location.title}: ${(result.distance / 1000).toFixed(2)} km (${(result.duration / 60).toFixed(0)} min)`);
    } else {
      console.log(`✗ ${location.title}: Failed to calculate`);
    }
    
    completed++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log(`\n✓ Distance calculations complete!`);
  console.log(`✓ Successfully calculated ${Object.keys(distances).length} out of ${total} distances`);
  
  // Build output object
  const output = {
    userLocation: {
      title: userLocation.title,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    },
    distances: distances
  };
  
  // Save to JSON file
  const outputPath = path.join(__dirname, '../src/data/user-distances.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`✓ Saved to: ${outputPath}`);
  
  // Print closest destinations
  const sorted = Object.entries(distances)
    .filter(([_, data]) => data.distance !== null)
    .sort((a, b) => a[1].distance - b[1].distance)
    .slice(0, 5);
  
  console.log('\nClosest 5 destinations:');
  sorted.forEach(([name, data], index) => {
    console.log(`  ${index + 1}. ${name}: ${(data.distance / 1000).toFixed(2)} km (${(data.duration / 60).toFixed(0)} min)`);
  });
}

// Run the script
buildUserDistances().catch(error => {
  console.error('\nError generating user distances:', error.message);
  process.exit(1);
});

