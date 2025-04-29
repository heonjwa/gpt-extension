// In a new file: src/shared/services/StatsService.ts

// Interface for user stats
export interface UserStats {
  totalTokensSaved: number;
  treesGrown: number;
  carbonSaved: number;  // in grams
  lastUpdated: string;
}

// Default stats for new users
const DEFAULT_STATS: UserStats = {
  totalTokensSaved: 0,
  treesGrown: 0,
  carbonSaved: 0,
  lastUpdated: new Date().toISOString()
};

// Constants for environmental impact calculations
const TOKENS_PER_TREE = 100;  // Number of tokens to grow one tree
const CARBON_PER_TOKEN = 0.2;   // Grams of CO2 saved per token (approximate)

// Function to update user stats
export async function updateTokenSavings(tokensSaved: number): Promise<UserStats> {
  // Get current stats
  const { stats } = await chrome.storage.local.get({ stats: DEFAULT_STATS });
  
  // Calculate new values
  const newTotalTokens = stats.totalTokensSaved + tokensSaved;
  const newCarbonSaved = stats.carbonSaved + (tokensSaved * CARBON_PER_TOKEN);
  const newTreesGrown = Math.floor(newTotalTokens / TOKENS_PER_TREE);
  
  // Create updated stats object
  const updatedStats: UserStats = {
    totalTokensSaved: newTotalTokens,
    treesGrown: newTreesGrown,
    carbonSaved: newCarbonSaved,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to storage
  await chrome.storage.local.set({ stats: updatedStats });
  
  return updatedStats;
}

// Function to get current user stats
export async function getUserStats(): Promise<UserStats> {
  const { stats } = await chrome.storage.local.get({ stats: DEFAULT_STATS });
  return stats;
}

// Function to reset user stats
export async function resetUserStats(): Promise<void> {
  await chrome.storage.local.set({ stats: DEFAULT_STATS });
}

// Keep track of the last number of trees
let lastTreesGrown = 0;

// Function to check if a new tree has been grown
export async function checkNewTreeMilestone(): Promise<boolean> {
  const stats = await getUserStats();
  const newTreeGrown = stats.treesGrown > lastTreesGrown;
  lastTreesGrown = stats.treesGrown;
  return newTreeGrown;
}