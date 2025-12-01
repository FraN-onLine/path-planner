"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Navigation,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  formatDistance,
  formatDuration,
  getManeuverIcon,
} from "@/lib/directions";

// Get Lucide icon component for maneuver type
function getManeuverIconComponent(iconType) {
  const iconMap = {
    'turn-left': ArrowLeft,
    'turn-right': ArrowRight,
    'straight': ArrowUp,
    'depart': Navigation,
    'arrive': MapPin,
    'merge': ArrowRight,
    'roundabout': ArrowRight,
  };
  
  return iconMap[iconType] || ArrowUp;
}

export default function DirectionsPanel({ route, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!route || !route.steps) {
    return null;
  }

  const { from, to, distance, duration, steps } = route;

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Directions</h3>
            <div className="text-xs text-slate-600">
              <div className="flex items-center gap-1 mb-1">
                <Navigation size={12} />
                <span className="font-medium">{from}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="font-medium">{to}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
            aria-label="Close directions"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>
        
        {/* Summary */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-700 mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1">
            <span className="text-blue-600">{formatDistance(distance)}</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-600">{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-white hover:bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700 transition-colors"
      >
        <span>{isExpanded ? 'Hide' : 'Show'} {steps.filter(s => s.maneuver.type !== 'arrive').length} steps</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Steps List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {steps
            .filter(step => step.maneuver.type !== 'arrive')
            .map((step, index, filteredSteps) => {
              const maneuverIcon = getManeuverIcon(step.maneuver);
              const IconComponent = getManeuverIconComponent(maneuverIcon);
              const isLastStep = index === filteredSteps.length - 1;

              return (
                <div
                  key={index}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    isLastStep ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isLastStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>

                    {/* Instruction */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium mb-1">
                        {step.maneuver.instruction}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDistance(step.distance)}</span>
                        {step.name && (
                          <>
                            <span>·</span>
                            <span className="truncate">{step.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

