import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Welcome() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-card/70 backdrop-blur px-3 py-1.5 border border-border/60 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <Image src="/map-pin-area.svg" alt="Ilocos Norte Tourism Path Planner" width={20} height={20} />
            </span>
            <span className="font-medium tracking-tight">Ilocos Norte Tourism Path Planner</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
          <div className="transition-colors hover:text-foreground">Bring joy to your journey.</div>
          <span className="h-4 w-px bg-border"></span>
          <Button asChild variant="secondary" className="rounded-full px-5">
            <Link href="/onboarding">Start Planning</Link>
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-6">
        {/* Hero */}
        <div className="relative text-center max-w-5xl animate-slide-up">
          {/* Floating gradient accents */}
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.primary/30),transparent_60%)] blur-2xl animate-float-soft" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.accent/40),transparent_60%)] blur-2xl animate-float-soft" />
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--ring)_60%,var(--primary))] bg-clip-text text-transparent">
              Save Time, Save Fuel
            </span>
            <br className="hidden sm:block" />
            <span className="text-foreground/80">with our intelligent path planner.</span>
          </h1>
          {/* Animated underline */}
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/60 animate-pop-in" />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/70">
            Ilocos Norte Tourism Path Planner is the intelligent software your family & friends will love for their next adventure.
          </p>

          {/* CTA Button */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
              <Link href="/onboarding">Start Planning</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 rounded-full px-8 text-lg transition-transform hover:-translate-y-0.5">
              <Link href="/map">Explore Map</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}