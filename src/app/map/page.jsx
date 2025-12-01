"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, MapPin, Layers, Send, Star } from "lucide-react";
import MapComponent from "@/components/map";
import locationsData from "@/data/locations.json";
import { useSearchParams } from "next/navigation";

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

// Rule: shouldShow(Place, Params) :- 
//   ¬anyInterestSelected(Params) ∨ matchesInterest(Place, Params)
const shouldShow = (place, params) => 
  !anyInterestSelected(params) || matchesInterest(place, params);

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
  
  // Query: findPlaces(Params) :- 
  //   ∀ Place ∈ allPlaces | shouldShow(Place, Params)
  const filteredPlaces = allPlaces.filter(place => shouldShow(place, searchParams));
  
  // Query: sortPlaces(Places) :- 
  //   Places sorted by compareByOpenStatus
  const sortedPlaces = [...filteredPlaces].sort(compareByOpenStatus);

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-medium text-xl tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <Image src="/map-pin-area.svg" alt="Ilocos Norte Tourism Path Planner" width={20} height={20} />
              </span>
              <span>Ilocos Norte Tourism Path Planner</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <div className="transition-colors hover:text-black">
              Bring joy to your journey.
            </div>
            <span className="h-4 w-px bg-slate-200"></span>
            <Button
              asChild
              variant="secondary"
              className="rounded-full bg-slate-100 px-5 font-medium text-slate-900 hover:bg-slate-200"
            >
              <Link href="/onboarding">Reset Planning</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content - 3 Column Layout */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - AI Chatbot */}
        {/* Jeiwinfre's code will go here */}

        {/* Middle Panel - Destination Cards */}
        <section className="w-[420px] bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Layers size={18} />
                <span>Destinations</span>
              </div>
              <span className="text-xs text-slate-500">{sortedPlaces.length} places</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Destination cards */}
            <div className="grid grid-cols-2 gap-3">
              {sortedPlaces.map((place, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
                >
                  {/* Photo placeholder */}
                  <div className="aspect-square bg-slate-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                      Photo
                    </div>
                  </div>
                  {/* Card Content */}
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{place.title}</h3>
                      <div className="flex items-center gap-0.5 text-xs shrink-0">
                        <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
                        <span>{place.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500">{place.timeRange}</span>
                      <span className={`font-medium ${getIsOpen(place.timeRange) ? 'text-green-600' : 'text-red-600'}`}>
                        {getIsOpen(place.timeRange) ? '· Open' : '· Closed'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{place.type}</p>
                    <p className="text-slate-400 text-xs truncate">{place.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel - Map */}
        <section className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md text-sm font-medium text-slate-900">
              <MapPin size={16} />
              <span>Ilocos Norte, Philippines</span>
            </div>
          </div>
          <MapComponent destinations={sortedPlaces} />
        </section>
      </main>
    </div>
  );
}