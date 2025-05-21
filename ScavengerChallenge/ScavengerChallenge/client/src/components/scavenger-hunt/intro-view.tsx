import { useHunt } from "@/contexts/hunt-context";

export function IntroView() {
  const { startHunt } = useHunt();
  
  return (
    <div id="intro-view" className="bg-white rounded-xl p-8 shadow-md text-center fade-in">
      <div className="mb-6">
        <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-20 mx-auto">
          <i className="fas fa-map-marked-alt text-primary text-3xl"></i>
        </span>
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome to the Scavenger Hunt!</h2>
      <p className="text-neutral-600 mb-6">You'll be presented with clues one by one. Try to guess the location based on the clues provided.</p>
      
      <div className="space-y-4 mb-8 text-left">
        <div className="bg-neutral-100 rounded-lg p-4">
          <h3 className="font-medium text-neutral-800 mb-2">How to Play:</h3>
          <ul className="text-sm text-neutral-600 space-y-2">
            <li className="flex items-start">
              <i className="fas fa-circle text-xs mt-1.5 mr-2 text-primary"></i>
              <span>Read each clue carefully and enter your guess</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-circle text-xs mt-1.5 mr-2 text-primary"></i>
              <span>If you're stuck, request another clue</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-circle text-xs mt-1.5 mr-2 text-primary"></i>
              <span>After seeing all clues, you can skip to the next location</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-circle text-xs mt-1.5 mr-2 text-primary"></i>
              <span>Find all locations to complete the hunt!</span>
            </li>
          </ul>
        </div>
      </div>
      
      <button 
        onClick={startHunt}
        className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition"
      >
        Start the Hunt
      </button>
    </div>
  );
}
