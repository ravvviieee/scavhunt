import { apiRequest } from "./queryClient";
import { ClueLocation, GameState } from "@shared/schema";

export async function getLocations(): Promise<ClueLocation[]> {
  const response = await fetch('/api/locations');
  if (!response.ok) {
    throw new Error('Failed to fetch locations');
  }
  return await response.json();
}

export async function getGameState(): Promise<GameState | null> {
  try {
    const response = await fetch('/api/game-state');
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch game state');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching game state:', error);
    return null;
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  await apiRequest('POST', '/api/game-state', state);
}
