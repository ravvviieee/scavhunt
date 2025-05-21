import { useHunt } from "@/contexts/hunt-context";

export function ProgressTracker() {
  const { gameState, huntData } = useHunt();
  
  if (!huntData || huntData.length === 0) return null;

  const currentLocation = huntData[gameState.currentLocationIndex];
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Your Progress</h2>
        <span className="text-sm font-medium text-primary">
          {gameState.currentLocationIndex + 1}/{huntData.length}
        </span>
      </div>
      
      <div className={`grid grid-cols-${huntData.length > 8 ? '8' : huntData.length} gap-1`}>
        {huntData.map((location, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full ${
              gameState.completedLocations.includes(index) 
                ? 'bg-secondary' 
                : index === gameState.currentLocationIndex 
                  ? 'bg-primary' 
                  : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
      
      <div className="mt-4 text-sm text-neutral-500">
        <span>Looking for: Location #{gameState.currentLocationIndex + 1}</span>
      </div>
    </div>
  );
}
