"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, MapPin, Layers, Send, Star } from "lucide-react";
import MapComponent from "@/components/map";
import locationsData from "@/data/locations.json";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const allPlaces = locationsData;

// Prolog-style rules for filtering and sorting

// Rule: interest(Type, Params) :- Params[Type] = true
const interestSelected = (type, params) => params.get(type) === 'true';

// Rule: anyInterestSelected(Params) :- ∃ Interest | interestSelected(Interest, Params)
const anyInterestSelected = (params) => {
  const interests = ['churches', 'beaches', 'museums', 'cuisine', 'nature', 'landmarks', 'history', 'shopping'];
  return interests.some(interest => interestSelected(interest, params));
};

// Rule: matchesInterest(Place, Params) :- interestSelected(Place.type, Params)
const matchesInterest = (place, params) => interestSelected(place.type, params);

// Rule: isOpen24Hours(TimeRange) :- TimeRange = "Open 24 hours"
const isOpen24Hours = (timeRange) => timeRange === "Open 24 hours";

// Rule: parseTime(TimeString) → Minutes
const parseTime = (time) => {
  const [hourMin, period] = time.split(" ");
  let [hours, minutes] = hourMin.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Rule: currentTimeInMinutes() → Minutes
const currentTimeInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Rule: withinTimeRange(CurrentTime, StartTime, EndTime) :- 
//   CurrentTime >= StartTime ∧ CurrentTime <= EndTime
const withinTimeRange = (current, start, end) => 
  current >= start && current <= end;

// Rule: isOpen(TimeRange) :- 
//   isOpen24Hours(TimeRange) ∨ withinTimeRange(currentTime, startTime, endTime)
function getIsOpen(timeRange) {
  if (isOpen24Hours(timeRange)) return true;
  
  const [start, end] = timeRange.split(" - ");
  const current = currentTimeInMinutes();
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  
  return withinTimeRange(current, startTime, endTime);
}

// Rule: shouldShowInCards(Place, Params) :- 
//   ¬anyInterestSelected(Params) ∨ matchesInterest(Place, Params)
const shouldShowInCards = (place, params) => 
  !anyInterestSelected(params) || matchesInterest(place, params);

// Rule: shouldShowOnMap(Place, Params) :- 
//   shouldShowInCards(Place, Params) ∧ isOpen(Place.timeRange)
const shouldShowOnMap = (place, params) => 
  shouldShowInCards(place, params) && getIsOpen(place.timeRange);

// Rule: compareByOpenStatus(A, B) :- 
//   isOpen(A) ∧ ¬isOpen(B) → -1
//   ¬isOpen(A) ∧ isOpen(B) → 1
//   otherwise → 0
const compareByOpenStatus = (a, b) => {
  const aIsOpen = getIsOpen(a.timeRange);
  const bIsOpen = getIsOpen(b.timeRange);
  
  if (aIsOpen && !bIsOpen) return -1;
  if (!aIsOpen && bIsOpen) return 1;
  return 0;
};

export default function Map() {
  const searchParams = useSearchParams();
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Query: findPlacesForCards(Params) :- 
  //   ∀ Place ∈ allPlaces | shouldShowInCards(Place, Params)
  const placesForCards = allPlaces.filter(place => shouldShowInCards(place, searchParams));
  
  // Query: sortPlaces(Places) :- 
  //   Places sorted by compareByOpenStatus
  const sortedPlacesForCards = [...placesForCards].sort(compareByOpenStatus);
  
  // Query: findPlacesForMap(Params) :- 
  //   ∀ Place ∈ allPlaces | shouldShowOnMap(Place, Params)
  const placesForMap = allPlaces.filter(place => shouldShowOnMap(place, searchParams));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 px-6 py-4 border-b border-border/60 bg-card/70 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-medium text-lg tracking-tight hover:opacity-90 transition-opacity">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <Image src="/map-pin-area.svg" alt="Ilocos Norte Tourism Path Planner" width={20} height={20} />
              </span>
              <span>Ilocos Norte Tourism Path Planner</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
            <div className="transition-colors hover:text-foreground">Bring joy to your journey.</div>
            <span className="h-4 w-px bg-border"></span>
            <Button asChild variant="secondary" className="rounded-full px-5">
              <Link href="/onboarding">Reset Planning</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content - 3 Column Layout */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Destination Cards */}
        <section className="w-[420px] bg-card/70 backdrop-blur-md border-r border-border/60 flex flex-col animate-fade-in">
          <div className="p-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Layers size={18} />
                <span>Destinations</span>
              </div>
              <span className="text-xs text-foreground/60">{sortedPlacesForCards.length} places</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Destination cards */}
            <div className="grid grid-cols-2 gap-3">
              {sortedPlacesForCards.map((place, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPlace(place)}
                  className="rounded-xl border border-border/60 bg-card/70 backdrop-blur hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Photo placeholder */}
                  <div className="aspect-square relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] animate-shimmer" />
                    <div className="absolute inset-0 bg-muted" />
                  </div>
                  {/* Card Content */}
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{place.title}</h3>
                      <div className="flex items-center gap-0.5 text-xs shrink-0">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-600 font-medium">{place.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-foreground/60">{place.timeRange}</span>
                      <span className={`font-medium ${getIsOpen(place.timeRange) ? 'text-green-600' : 'text-red-600'}`}>
                        {getIsOpen(place.timeRange) ? '· Open' : '· Closed'}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-xs capitalize">{place.type}</p>
                    <p className="text-foreground/50 text-xs truncate">{place.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel - Map */}
        <section className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-3 py-2 rounded-full shadow text-sm font-medium">
              <MapPin size={16} />
              <span>Ilocos Norte, Philippines</span>
            </div>
          </div>
          <MapComponent destinations={placesForMap} />
        </section>
      </main>

      {/* Destination Details Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={(open) => !open && setSelectedPlace(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPlace && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPlace.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-foreground/70">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-yellow-600">{selectedPlace.rating}</span>
                  </span>
                  <span className="text-foreground/40">·</span>
                  <span className="capitalize">{selectedPlace.type}</span>
                  <span className="text-foreground/40">·</span>
                  <span className="text-foreground/70">{selectedPlace.timeRange}</span>
                  <span className={`font-medium ${getIsOpen(selectedPlace.timeRange) ? 'text-green-600' : 'text-red-600'}`}>
                    {getIsOpen(selectedPlace.timeRange) ? '· Open' : '· Closed'}
                  </span>
                </div>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                {/* Photo placeholder */}
                <div className="w-full h-64 bg-muted rounded-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
                    Photo
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-foreground/70 leading-relaxed">{selectedPlace.description}</p>
                </div>
                
                {/* Location Info */}
                <div className="pt-4 border-t border-border/60">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <MapPin size={16} />
                    <span>{selectedPlace.latitude.toFixed(6)}, {selectedPlace.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}