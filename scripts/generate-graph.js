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
  console.error('Usage: npm run generate-graph -- YOUR_MAPBOX_TOKEN');
  console.error('Or set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local file');
  process.exit(1);
}

console.log(`Processing ${locations.length} locations...`);

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

// Function to calculate distance between two locations using single route
async function calculateDistance(fromCoord, toCoord) {
  const coordinates = `${fromCoord};${toCoord}`;
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

// Main function to build graph
async function buildGraph() {
  const graph = {};
  
  // Initialize graph structure
  locations.forEach(location => {
    graph[location.title] = {};
  });
  
  console.log('Calculating distances between all location pairs...');
  console.log('This may take a few minutes...\n');
  
  let completed = 0;
  const total = locations.length * (locations.length - 1);
  
  // Calculate distance for each pair
  for (let i = 0; i < locations.length; i++) {
    const fromLocation = locations[i];
    const fromCoord = `${fromLocation.longitude},${fromLocation.latitude}`;
    
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        const toLocation = locations[j];
        const toCoord = `${toLocation.longitude},${toLocation.latitude}`;
        
        const result = await calculateDistance(fromCoord, toCoord);
        
        if (result.distance !== null) {
          graph[fromLocation.title][toLocation.title] = result;
        }
        
        completed++;
        if (completed % 50 === 0 || completed === total) {
          const percent = ((completed / total) * 100).toFixed(1);
          process.stdout.write(`\rProgress: ${completed}/${total} (${percent}%)   `);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log('\n\n✓ Distance calculations complete!');
  
  // Save graph to JSON file
  const outputPath = path.join(__dirname, '../src/data/distance-graph.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
  
  console.log(`✓ Saved to: ${outputPath}`);
  console.log(`✓ Graph contains ${locations.length} nodes with ${total} edges`);
  
  // Print some sample distances for verification
  console.log('\nSample distances:');
  const firstLocation = locations[0].title;
  const samples = Object.entries(graph[firstLocation]).slice(0, 3);
  samples.forEach(([dest, data]) => {
    console.log(`  ${firstLocation} → ${dest}: ${(data.distance / 1000).toFixed(2)} km (${(data.duration / 60).toFixed(0)} min)`);
  });
}

// Run the script
buildGraph().catch(error => {
  console.error('\nError generating graph:', error.message);
  process.exit(1);
});
