import { useHunt } from "@/contexts/hunt-context";
import { ClueCard } from "./clue-card";
import { ProgressTracker } from "./progress-tracker";
import { AnswerForm } from "./answer-form";
import { IntroView } from "./intro-view";
import { GameComplete } from "./game-complete";
import { useEffect } from "react";

export function HuntContainer() {
  const { gameState, loading } = useHunt();

  if (loading) {
    return (
      <div id="loading-state" className="text-center py-12 fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-neutral-600">Loading your adventure...</p>
      </div>
    );
  }

  if (gameState.showIntro) {
    return <IntroView />;
  }

  const allLocationsComplete = gameState.completedLocations.length === gameState.totalLocations;
  if (allLocationsComplete && gameState.endTime) {
    return <GameComplete />;
  }

  return (
    <div id="active-hunt" className="space-y-6 fade-in">
      <ProgressTracker />
      <ClueCard />
      <AnswerForm />
    </div>
  );
}
