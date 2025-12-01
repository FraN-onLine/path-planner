"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Church,
  Palmtree,
  Landmark,
  Utensils,
  Mountain,
  Camera,
  History,
  ShoppingBag,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { sortByClosestDistance } from "@/lib/ucs";
import userDistancesData from "@/data/user-distances.json";
import { getRouteDirections } from "@/lib/directions";
import DirectionsPanel from "@/components/DirectionsPanel";

// Map location types to Lucide React icons
function getIconComponent(type) {
  const iconMap = {
    churches: Church,
    beaches: Palmtree,
    museums: Landmark,
    cuisine: Utensils,
    nature: Mountain,
    landmarks: Camera,
    history: History,
    shopping: ShoppingBag,
  };
  return iconMap[type] || MapPin;
}

function createMarkerElement(type, title) {
  const container = document.createElement("div");
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  `;
  
  // Icon marker
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.cssText = `
    width: 32px;
    height: 32px;
    background-color: white;
    border: 2px solid #1e293b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  
  // Render React icon component into the DOM element
  const IconComponent = getIconComponent(type);
  const root = createRoot(el);
  root.render(<IconComponent size={18} color="#1e293b" />);
  
  // Label with location name
  const label = document.createElement("div");
  label.textContent = title;
  label.style.cssText = `
    margin-top: 4px;
    padding: 2px 6px;
    background-color: white;
    border: 1px solid #1e293b;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    pointer-events: none;
  `;
  
  container.appendChild(el);
  container.appendChild(label);
  
  return container;
}

function createUserLocationMarker() {
  // User location marker with pulsing effect
  const el = document.createElement("div");
  el.className = "user-location-marker";
  el.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    position: relative;
  `;
  
  // Add pulsing animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      }
    }
    .user-location-marker {
      animation: pulse 2s infinite;
    }
  `;
  document.head.appendChild(style);
  
  // Render User icon
  const root = createRoot(el);
  root.render(<User size={20} color="white" strokeWidth={2.5} />);
  
  return el;
}

export default function Map({ destinations = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const destinationMarkers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // User location (CCIS)
  const userLocation = {
    title: "Your Location (CCIS)",
    latitude: 18.059779,
    longitude: 120.545021,
  };

  // Sort destinations by closest distance using UCS (memoized)
  const sortedDestinations = useMemo(() => {
    return sortByClosestDistance(destinations, userDistancesData);
  }, [destinations]);

  // Reset to user location (index 0) when destinations change
  useEffect(() => {
    setCurrentIndex(0);
  }, [sortedDestinations.length]);

  // Center map on a specific destination (memoized)
  const centerMapOn = useCallback((destination) => {
    if (map.current && destination && destination.latitude && destination.longitude) {
      map.current.flyTo({
        center: [destination.longitude, destination.latitude],
        zoom: 12,
        duration: 1500,
      });
    }
  }, []);

  // Fetch and display route
  const fetchAndDisplayRoute = useCallback(async (fromLoc, toLoc) => {
    if (!map.current || !fromLoc || !toLoc) return;

    setIsLoadingRoute(true);
    
    try {
      const route = await getRouteDirections(fromLoc, toLoc);
      
      if (route) {
        setCurrentRoute(route);
        
        // Add route to map
        import("mapbox-gl").then((mapboxgl) => {
          if (!map.current) return;
          
          // Remove existing route if present
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          // Add route source and layer
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            },
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // Navigate to previous destination
  const goToPrevious = () => {
    if (sortedDestinations.length === 0) return;
    const newIndex = currentIndex === 0 ? sortedDestinations.length : currentIndex - 1;
    setCurrentIndex(newIndex);

    if (newIndex === 0) {
      // Back to user location
      centerMapOn({ latitude: userLocation.latitude, longitude: userLocation.longitude });
      // Show route to first destination
      if (sortedDestinations[0]) {
        fetchAndDisplayRoute(userLocation, sortedDestinations[0]);
      }
    } else {
      // At a destination
      centerMapOn(sortedDestinations[newIndex - 1]);
      // Show route from previous location
      const from = newIndex === 1 ? userLocation : sortedDestinations[newIndex - 2];
      const to = sortedDestinations[newIndex - 1];
      fetchAndDisplayRoute(from, to);
    }
  };

  // Navigate to next destination
  const goToNext = () => {
    if (sortedDestinations.length === 0) return;
    const newIndex = currentIndex === sortedDestinations.length ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);

    if (newIndex === 0) {
      // Back to user location
      centerMapOn({ latitude: userLocation.latitude, longitude: userLocation.longitude });
      // Show route to first destination
      if (sortedDestinations[0]) {
        fetchAndDisplayRoute(userLocation, sortedDestinations[0]);
      }
    } else {
      // Moving to a destination
      centerMapOn(sortedDestinations[newIndex - 1]);
      // Show route from previous location
      const from = newIndex === 1 ? userLocation : sortedDestinations[newIndex - 2];
      const to = sortedDestinations[newIndex - 1];
      fetchAndDisplayRoute(from, to);
    }
  };

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    import("mapbox-gl").then((mapboxgl) => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      
      if (!token) {
        console.error("Mapbox token is not set");
        return;
      }

      mapboxgl.default.accessToken = token;

      // CCIS Coordinates: 18.059779° N, 120.545021° E
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [120.545021, 18.059779], // [longitude, latitude]
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl(), "top-right");

      // Add user location marker at CCIS (mock user location)
      const userLocationMarker = createUserLocationMarker();
      new mapboxgl.default.Marker(userLocationMarker)
        .setLngLat([120.545021, 18.059779])
        .addTo(map.current);

      // Mark map as loaded when ready
      map.current.on('load', () => {
        setMapLoaded(true);
      });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when destinations change (after map is loaded)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    import("mapbox-gl").then((mapboxgl) => {
      // Remove existing destination markers
      destinationMarkers.current.forEach(marker => marker.remove());
      destinationMarkers.current = [];

      // Add new markers for destinations
      if (sortedDestinations && sortedDestinations.length > 0) {
        sortedDestinations.forEach((dest) => {
          if (dest.latitude && dest.longitude) {
            const el = createMarkerElement(dest.type, dest.title);
            
            const marker = new mapboxgl.default.Marker(el)
              .setLngLat([dest.longitude, dest.latitude])
              .addTo(map.current);
            
            destinationMarkers.current.push(marker);
          }
        });

        // Start at user location (index 0), show route to first destination
        const firstDest = sortedDestinations[0];
        if (firstDest) {
          // Fetch initial route from user to first destination
          fetchAndDisplayRoute(userLocation, firstDest);
        }
      }
    });
  }, [sortedDestinations, mapLoaded, fetchAndDisplayRoute]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Directions Panel */}
      {currentRoute && (
        <DirectionsPanel 
          route={currentRoute} 
          onClose={() => setCurrentRoute(null)} 
        />
      )}
      
      {/* Bottom Navigation Control */}
      {sortedDestinations.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-lg border border-slate-200">
            <button
              onClick={goToPrevious}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Previous destination"
            >
              <ChevronLeft size={20} className="text-slate-700" />
            </button>
            
            <div className="px-2 min-w-[200px] text-center">
              <div className="text-sm font-semibold text-slate-900">
                {currentIndex === 0 
                  ? userLocation.title 
                  : sortedDestinations[currentIndex - 1]?.title || 'Unknown'}
              </div>
              <div className="text-xs text-slate-500">
                {currentIndex} of {sortedDestinations.length}
              </div>
            </div>
            
            <button
              onClick={goToNext}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Next destination"
            >
              <ChevronRight size={20} className="text-slate-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

