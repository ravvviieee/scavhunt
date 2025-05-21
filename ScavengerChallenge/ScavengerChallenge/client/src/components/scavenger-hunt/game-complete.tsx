import { useHunt } from "@/contexts/hunt-context";

export function GameComplete() {
  const { gameState, restartHunt, huntData } = useHunt();
  
  let completionTime = "00:00";
  if (gameState.startTime && gameState.endTime) {
    const totalSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    completionTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  
  return (
    <div id="game-complete" className="bg-white rounded-xl p-8 shadow-md text-center fade-in">
      <div className="mb-6">
        <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary bg-opacity-20 mx-auto">
          <i className="fas fa-trophy text-secondary text-3xl"></i>
        </span>
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Congratulations! 🎉</h2>
      <p className="text-neutral-600 mb-6">You've completed the entire scavenger hunt!</p>
      <div className="bg-neutral-100 rounded-lg p-4 mb-6">
        <p className="font-medium">Your completion time: <span className="font-bold">{completionTime}</span></p>
        <p className="text-sm text-neutral-500 mt-2">You found all <span className="font-semibold">{huntData.length}</span> locations!</p>
      </div>
      <button 
        onClick={restartHunt}
        className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition"
      >
        Start a New Hunt
      </button>
    </div>
  );
}
