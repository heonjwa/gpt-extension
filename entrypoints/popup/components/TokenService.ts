/**
 * tokenService.ts
 * Service for optimizing text to reduce token usage in LLM requests
 * Updated to use the MongoDB-based API with local fallback processing
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
 * Main function to optimize text for token reduction using the API,
 * with local fallback optimization if API call fails
 */
export const optimizeTokens = async (text: string): Promise<{
  optimized: string;
  tokenMetrics?: {
    originalTokenCount: number;
    simplifiedTokenCount: number;
    tokensSaved: number;
    percentSaved: number;
  };
}> => {
  try {
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
      return {
        optimized: localOptimizeText(text),
        tokenMetrics: getTokenMetrics(text, localOptimizeText(text)),
      };
    }

    return {
      optimized: data.paraphrased,
      tokenMetrics: data.tokenMetrics,
    };
  } catch (error) {
    console.error('Error calling paraphrase API:', error);
    const locallyOptimized = localOptimizeText(text);
    return {
      optimized: locallyOptimized,
      tokenMetrics: getTokenMetrics(text, locallyOptimized),
    };
  }
};

/**
 * Estimate token count based on API metrics or fallback to local estimation
 */
export const estimateTokenCount = async (text: string): Promise<number> => {
  try {
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
  // Rough estimate: 4 characters per token on average
  return Math.ceil(text.length / 4);
};

/**
 * Fallback: optimize text locally by removing courtesy, filler, and verbose phrases
 */
const localOptimizeText = (text: string): string => {
  let optimized = text;

  // Courtesy phrases to remove
  const courtesyPhrases = [
    "please note that",
    "thank you for your time",
    "I would like to",
    "if you don't mind",
    "I hope this helps",
  ];

  // Filler words to remove
  const fillerWords = [
    "actually", "basically", "literally", "just", "really", "very", "perhaps", "maybe"
  ];

  // Verbose to concise replacements
  const verboseMap: Record<string, string> = {
    "in order to": "to",
    "due to the fact that": "because",
    "at this point in time": "now",
    "with regard to": "about",
    "despite the fact that": "although"
  };

  // Contractions
  const contractionsMap: Record<string, string> = {
    "do not": "don't",
    "does not": "doesn't",
    "can not": "can't",
    "will not": "won't",
    "I am": "I'm",
    "you are": "you're",
    "they are": "they're",
    "we are": "we're",
    "is not": "isn't",
    "are not": "aren't",
  };

  for (const phrase of courtesyPhrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    optimized = optimized.replace(regex, "");
  }

  for (const word of fillerWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    optimized = optimized.replace(regex, "");
  }

  for (const [verbose, concise] of Object.entries(verboseMap)) {
    const regex = new RegExp(`\\b${verbose}\\b`, "gi");
    optimized = optimized.replace(regex, concise);
  }

  for (const [full, contraction] of Object.entries(contractionsMap)) {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    optimized = optimized.replace(regex, contraction);
  }

  // Clean up extra whitespace
  optimized = optimized.replace(/\s{2,}/g, " ").trim();

  return optimized;
};

/**
 * Estimate token savings from local optimization
 */
const getTokenMetrics = (original: string, optimized: string) => {
  const originalCount = fallbackEstimateTokenCount(original);
  const simplifiedCount = fallbackEstimateTokenCount(optimized);
  const tokensSaved = originalCount - simplifiedCount;
  const percentSaved = originalCount > 0 ? (tokensSaved / originalCount) * 100 : 0;

  return {
    originalTokenCount: originalCount,
    simplifiedTokenCount: simplifiedCount,
    tokensSaved,
    percentSaved: Math.round(percentSaved * 10) / 10, // round to 1 decimal
  };
};
