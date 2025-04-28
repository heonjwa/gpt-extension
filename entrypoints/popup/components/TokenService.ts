/**
 * tokenService.ts
 * Service for optimizing text to reduce token usage in LLM requests
 * Updated to use the MongoDB-based API instead of local processing
 */

interface TokenResponse {
  success: boolean;
  original: string;
  paraphrased: string;
  tokenMetrics: {
    originalTokenCount: number;
    simplifiedTokenCount: number;
    tokensSaved: number;
    percentSaved: number;
  };
  error?: string;
}

/**
 * Main function to optimize text for token reduction using the API
 */
export const optimizeTokens = async (text: string): Promise<{
  optimized: string;
  tokenMetrics?: {
    originalTokenCount: number;
    simplifiedTokenCount: number;
    tokensSaved: number;
    percentSaved: number;
  }
}> => {
  try {
    // Call the paraphrase API
    const response = await fetch('http://localhost:8000/api/paraphrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data: TokenResponse = await response.json();

    if (!data.success) {
      console.error('API Error:', data.error);
      return { optimized: text }; // Return original text if API fails
    }

    return {
      optimized: data.paraphrased,
      tokenMetrics: data.tokenMetrics
    };
  } catch (error) {
    console.error('Error calling paraphrase API:', error);
    return { optimized: text }; // Return original text if API call fails
  }
};

/**
 * Estimate token count based on API metrics or fallback to local estimation
 */
export const estimateTokenCount = async (text: string): Promise<number> => {
  try {
    // Use the API to get token count
    const response = await fetch('http://localhost:8000/api/paraphrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data: TokenResponse = await response.json();

    if (!data.success) {
      return fallbackEstimateTokenCount(text);
    }

    return data.tokenMetrics.originalTokenCount;
  } catch (error) {
    return fallbackEstimateTokenCount(text);
  }
};

/**
 * Fallback local estimation if API is unavailable
 */
const fallbackEstimateTokenCount = (text: string): number => {
  // Rough estimate: 4 characters per token on average for English text
  return Math.ceil(text.length / 4);
};