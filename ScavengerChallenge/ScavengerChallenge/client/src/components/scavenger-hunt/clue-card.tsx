import { useHunt } from "@/contexts/hunt-context";

export function ClueCard() {
  const { gameState, huntData } = useHunt();
  
  if (!huntData || huntData.length === 0) return null;
  
  const currentLocation = huntData[gameState.currentLocationIndex];
  const visibleClues = gameState.visibleClueIndices.map(index => currentLocation.clues[index]);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">Current Clues</h3>
        <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
          {gameState.visibleClueIndices.length}/{currentLocation.clues.length}
        </span>
      </div>
      
      <div className="p-6">
        {visibleClues.map((clue, index) => (
          <div key={index} className="clue-item mb-4 last:mb-0 fade-in">
            <div className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary text-sm font-medium mr-3">
                {index + 1}
              </span>
              <p className="text-neutral-700">{clue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
