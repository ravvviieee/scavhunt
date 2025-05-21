import { HuntContainer } from "@/components/scavenger-hunt/hunt-container";
import { useHunt } from "@/contexts/hunt-context";
import { useEffect } from "react";
import { Header } from "@/components/nav/header";

export default function Home() {
  const { initializeHunt } = useHunt();

  useEffect(() => {
    initializeHunt();
  }, [initializeHunt]);

  return (
    <div className="bg-neutral-100 min-h-screen font-sans">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Scavenger Hunt</h1>
          <p className="text-neutral-600">Solve the clues to find hidden locations!</p>
        </header>

        <HuntContainer />
      </div>
    </div>
  );
}
