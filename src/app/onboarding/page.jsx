"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Church,
  Palmtree,
  Landmark,
  Utensils,
  Mountain,
  Camera,
  History,
  ShoppingBag,
} from "lucide-react";

const INTERESTS = [
  { id: "churches", label: "Churches", icon: Church },
  { id: "beaches", label: "Beaches", icon: Palmtree },
  { id: "museums", label: "Museums", icon: Landmark },
  { id: "cuisine", label: "Cuisine", icon: Utensils },
  { id: "nature", label: "Nature", icon: Mountain },
  { id: "landmarks", label: "Landmarks", icon: Camera },
  { id: "history", label: "History", icon: History },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
];

export default function Onboarding() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    const queryString = selectedInterests
      .map((id) => `${id}=true`)
      .join("&");
    router.push(`/map?${queryString}`);
  };

  return (
    <div className="min-h-screen">
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl text-center animate-slide-up">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--ring)_60%,var(--primary))] bg-clip-text text-transparent">What interests you?</span>
          </h1>
          <p className="mb-12 text-lg text-foreground/70">
            Select the experiences you'd like to include in your Ilocos Norte journey. We'll tailor recommendations just for you.
          </p>

          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {INTERESTS.map((interest, idx) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);

              return (
                <Card
                  key={interest.id}
                  className={cn(
                    "cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md hover:scale-[1.02] border-2 bg-card/70 backdrop-blur animate-pop-in",
                    isSelected
                      ? "border-primary/60"
                      : "border-transparent hover:border-border/80"
                  )}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div
                      className={cn(
                        "mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors shadow-sm",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground"
                      )}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="font-medium">{interest.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full px-8 text-lg"
              onClick={() => router.push("/map")}
            >
              Back
            </Button>
            <Button
              size="lg"
              disabled={selectedInterests.length === 0}
              className={cn(
                "h-14 rounded-full px-10 text-lg font-semibold",
                selectedInterests.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
