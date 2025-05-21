import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { GameState, ClueLocation } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { getLocations, getGameState, saveGameState } from '@/lib/api';

interface HuntContextType {
  huntData: ClueLocation[];
  gameState: GameState & {
    totalLocations: number;
  };
  loading: boolean;
  initializeHunt: () => Promise<void>;
  startHunt: () => void;
  checkAnswer: (answer: string) => void;
  requestNextClue: () => void;
  giveUpAndSkip: () => void;
  restartHunt: () => void;
}

// Create context with default values to avoid undefined issues
const defaultContext: HuntContextType = {
  huntData: [],
  gameState: {
    currentLocationIndex: 0,
    visibleClueIndices: [0],
    startTime: null,
    endTime: null,
    showIntro: true,
    completedLocations: [],
    totalLocations: 0
  },
  loading: true,
  initializeHunt: async () => {},
  startHunt: () => {},
  checkAnswer: () => {},
  requestNextClue: () => {},
  giveUpAndSkip: () => {},
  restartHunt: () => {}
};

const HuntContext = createContext<HuntContextType>(defaultContext);

const initialGameState: GameState & { totalLocations: number } = {
  currentLocationIndex: 0,
  visibleClueIndices: [0],
  startTime: null,
  endTime: null,
  showIntro: true,
  completedLocations: [],
  totalLocations: 0
};

export function HuntProvider({ children }: { children: ReactNode }) {
  const [huntData, setHuntData] = useState<ClueLocation[]>([]);
  const [gameState, setGameState] = useState<GameState & { totalLocations: number }>(initialGameState);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize hunt data and game state
  const initializeHunt = useCallback(async () => {
    setLoading(true);
    try {
      const locations = await getLocations();
      setHuntData(locations);
      
      // Try to get saved game state
      const savedState = await getGameState();
      
      if (savedState) {
        setGameState({
          ...savedState,
          totalLocations: locations.length
        });
      } else {
        setGameState({
          ...initialGameState,
          totalLocations: locations.length
        });
      }
    } catch (error) {
      console.error('Error initializing hunt:', error);
      toast({
        title: "Error",
        description: "Failed to load scavenger hunt data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Start hunt
  const startHunt = useCallback(() => {
    const newState = {
      ...gameState,
      showIntro: false,
      startTime: Date.now(),
    };
    
    setGameState(newState);
    saveGameState(newState);
  }, [gameState]);

  // Check answer
  const checkAnswer = useCallback((userAnswer: string) => {
    if (huntData.length === 0 || gameState.currentLocationIndex >= huntData.length) {
      return;
    }
    
    const currentLocation = huntData[gameState.currentLocationIndex];
    const normalizedUserAnswer = userAnswer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const normalizedCorrectAnswer = currentLocation.answer.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    
    const isCorrect = 
      normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
      normalizedCorrectAnswer.includes(normalizedUserAnswer);
    
    if (isCorrect) {
      // Show success toast
      toast({
        title: "Correct!",
        description: "Great job! That's the right answer.",
        className: "bg-neutral-800"
      });
      
      // Update completed locations
      const updatedCompletedLocations = [...gameState.completedLocations, gameState.currentLocationIndex];
      
      // Check if all locations are complete
      const nextIndex = gameState.currentLocationIndex + 1;
      const allComplete = nextIndex >= huntData.length;
      
      const newState = {
        ...gameState,
        currentLocationIndex: allComplete ? gameState.currentLocationIndex : nextIndex,
        visibleClueIndices: [0],
        completedLocations: updatedCompletedLocations,
        endTime: allComplete ? Date.now() : gameState.endTime
      };
      
      setGameState(newState);
      saveGameState(newState);
    } else {
      // Show error toast
      toast({
        title: "Incorrect",
        description: "That's not correct. Try again or get another clue.",
        variant: "destructive"
      });
    }
  }, [gameState, huntData, toast]);

  // Request next clue
  const requestNextClue = useCallback(() => {
    if (huntData.length === 0 || gameState.currentLocationIndex >= huntData.length) {
      return;
    }
    
    const currentLocation = huntData[gameState.currentLocationIndex];
    
    // Find the next clue index that isn't already visible
    for (let i = 0; i < currentLocation.clues.length; i++) {
      if (!gameState.visibleClueIndices.includes(i)) {
        const newVisibleIndices = [...gameState.visibleClueIndices, i];
        const newState = {
          ...gameState,
          visibleClueIndices: newVisibleIndices
        };
        
        setGameState(newState);
        saveGameState(newState);
        break;
      }
    }
  }, [gameState, huntData]);

  // Give up and skip to next location
  const giveUpAndSkip = useCallback(() => {
    if (huntData.length === 0 || gameState.currentLocationIndex >= huntData.length) {
      return;
    }
    
    const currentLocation = huntData[gameState.currentLocationIndex];
    
    // Show the answer in a toast
    toast({
      title: "Location Skipped",
      description: `The answer was: ${currentLocation.answer}`,
      variant: "destructive"
    });
    
    // Move to next location or complete the game
    const nextIndex = gameState.currentLocationIndex + 1;
    const allComplete = nextIndex >= huntData.length;
    
    const newState = {
      ...gameState,
      currentLocationIndex: allComplete ? gameState.currentLocationIndex : nextIndex,
      visibleClueIndices: [0],
      endTime: allComplete ? Date.now() : gameState.endTime
    };
    
    setGameState(newState);
    saveGameState(newState);
  }, [gameState, huntData, toast]);

  // Restart hunt
  const restartHunt = useCallback(() => {
    const newState = {
      ...initialGameState,
      showIntro: false,
      startTime: Date.now(),
      totalLocations: huntData.length
    };
    
    setGameState(newState);
    saveGameState(newState);
  }, [huntData.length]);

  return (
    <HuntContext.Provider
      value={{
        huntData,
        gameState,
        loading,
        initializeHunt,
        startHunt,
        checkAnswer,
        requestNextClue,
        giveUpAndSkip,
        restartHunt
      }}
    >
      {children}
    </HuntContext.Provider>
  );
}

export function useHunt() {
  const context = useContext(HuntContext);
  if (context === undefined) {
    throw new Error('useHunt must be used within a HuntProvider');
  }
  return context;
}
