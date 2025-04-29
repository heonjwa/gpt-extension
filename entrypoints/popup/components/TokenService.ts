/**
 * tokenService.ts
 * Service for optimizing text to reduce token usage in LLM requests
 * Updated to use the MongoDB-based API with local fallback processing
 * Enhanced with more comprehensive optimization patterns
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
 * Enhanced local text optimization to maximize token savings
 */
const localOptimizeText = (text: string): string => {
  let optimized = text;

  // Courtesy and introductory phrases to remove
  const courtesyPhrases = [
    "please",
    "thank you",
    "please note that",
    "thank you for your time",
    "I would like to",
    "if you don't mind",
    "I hope this helps",
    "I'm writing to",
    "I wanted to let you know",
    "I am reaching out to",
    "I would appreciate it if",
    "it would be great if",
    "for your information",
    "I was wondering if",
    "please let me know if",
    "kindly be informed that",
    "as you may know",
    "as you are aware",
    "as mentioned previously",
    "it has come to my attention",
    "I am happy to inform you that",
    "I regret to inform you that",
    "for your convenience",
    "don't hesitate to",
    "feel free to",
    "please feel free to"
  ];

  // Filler words to remove
  const fillerWords = [
    "actually", "basically", "literally", "just", "really", "very", "quite", 
    "perhaps", "maybe", "somewhat", "certainly", "definitely", "absolutely",
    "essentially", "practically", "generally", "simply", "frankly",
    "honestly", "truthfully", "obviously", "clearly", "undoubtedly",
    "needless to say", "as a matter of fact", "for all intents and purposes",
    "kind of", "sort of", "type of", "in my opinion", "I think that", 
    "I believe that", "more or less", "in essence", "in a manner of speaking",
    "so to speak", "as it were", "all things considered", "completely"
  ];

  // Verbose to concise replacements
  const verboseMap: Record<string, string> = {
    "in order to": "to",
    "due to the fact that": "because",
    "at this point in time": "now",
    "with regard to": "about",
    "despite the fact that": "although",
    "in the event that": "if",
    "in the process of": "",
    "on the subject of": "about",
    "in relation to": "about",
    "in the case of": "for",
    "in spite of the fact that": "although",
    "in light of the fact that": "because",
    "in view of the fact that": "since",
    "with reference to": "about",
    "taking into consideration": "considering",
    "for the purpose of": "for",
    "with the exception of": "except",
    "in connection with": "about",
    "in the course of": "during",
    "on the grounds that": "because",
    "in the near future": "soon",
    "at the present time": "now",
    "in close proximity to": "near",
    "until such time as": "until",
    "in the aftermath of": "after",
    "prior to the start of": "before",
    "subsequent to": "after",
    "for the reason that": "because",
    "in the vicinity of": "near",
    "on a regular basis": "regularly",
    "in a timely manner": "promptly",
    "at this moment in time": "now",
    "at an early date": "soon",
    "in the not too distant future": "soon",
    "on the occasion of": "when",
    "in a situation in which": "when",
    "a majority of": "most",
    "a sufficient amount of": "enough",
    "a significant number of": "many",
    "a considerable amount of": "much",
    "a large portion of": "most",
    "it is often the case that": "often",
    "under circumstances in which": "when",
    "a number of": "some",
    "the overwhelming majority of": "most"
  };

  // Contractions
  const contractionsMap: Record<string, string> = {
    "do not": "don't",
    "does not": "doesn't",
    "cannot": "can't",
    "can not": "can't",
    "will not": "won't",
    "I am": "I'm",
    "you are": "you're",
    "they are": "they're",
    "we are": "we're",
    "he is": "he's",
    "she is": "she's",
    "it is": "it's",
    "that is": "that's",
    "who is": "who's",
    "what is": "what's",
    "where is": "where's",
    "when is": "when's",
    "why is": "why's",
    "how is": "how's",
    "is not": "isn't",
    "are not": "aren't",
    "was not": "wasn't",
    "were not": "weren't",
    "has not": "hasn't",
    "have not": "haven't",
    "had not": "hadn't",
    "would not": "wouldn't",
    "could not": "couldn't",
    "should not": "shouldn't",
    "must not": "mustn't",
    "might not": "mightn't",
    "need not": "needn't",
    "I will": "I'll",
    "you will": "you'll",
    "he will": "he'll",
    "she will": "she'll",
    "it will": "it'll",
    "we will": "we'll",
    "they will": "they'll",
    "I would": "I'd",
    "you would": "you'd",
    "he would": "he'd",
    "she would": "she'd",
    "it would": "it'd",
    "we would": "we'd",
    "they would": "they'd",
    "I have": "I've",
    "you have": "you've",
    "they have": "they've",
    "we have": "we've",
    "could have": "could've",
    "would have": "would've",
    "should have": "should've",
    "might have": "might've",
    "must have": "must've"
  };

  // Remove redundant phrases
  const redundantPhrases = [
    "each and every",
    "first and foremost",
    "true and accurate",
    "full and complete",
    "various different",
    "basic fundamentals",
    "future plans",
    "past history",
    "unexpected surprise",
    "advance planning",
    "repeat again",
    "return back",
    "completely eliminate",
    "end result",
    "final outcome",
    "free gift",
    "exact same",
    "personal opinion",
    "currently happening",
    "still remains",
    "join together",
    "added bonus",
    "new innovation",
    "continue on",
    "collaborate together",
    "merge together",
    "completely finished",
    "past experience",
    "optional choice",
    "separate out",
    "sum total",
    "absolutely essential",
    "completely unanimous",
    "basic essentials",
    "collaborate with each other",
    "revert back",
    "ask the question",
    "totally perfect"
  ];

  // Passive to active voice markers (simple patterns)
  interface PassivePattern {
    regex: RegExp;
    replacement: (match: string, verb: string) => string;
  }

  const passivePatterns: PassivePattern[] = [
    { regex: /is being ([a-z]+ed) by/gi, replacement: (_, verb) => `is ${verb}ing` },
    { regex: /was being ([a-z]+ed) by/gi, replacement: (_, verb) => `was ${verb}ing` },
    { regex: /is ([a-z]+ed) by/gi, replacement: (_, verb) => `does ${verb}` },
    { regex: /was ([a-z]+ed) by/gi, replacement: (_, verb) => `did ${verb}` },
    { regex: /are ([a-z]+ed) by/gi, replacement: (_, verb) => `do ${verb}` },
    { regex: /were ([a-z]+ed) by/gi, replacement: (_, verb) => `did ${verb}` },
    { regex: /has been ([a-z]+ed) by/gi, replacement: (_, verb) => `has ${verb}ed` },
    { regex: /have been ([a-z]+ed) by/gi, replacement: (_, verb) => `have ${verb}ed` },
    { regex: /had been ([a-z]+ed) by/gi, replacement: (_, verb) => `had ${verb}ed` }
  ];

  // Advanced replacements: Common verbose constructions
  const advancedReplacements = [
    { regex: /it is necessary that/gi, replacement: "must" },
    { regex: /it is important that/gi, replacement: "importantly," },
    { regex: /it is recommended that/gi, replacement: "should" },
    { regex: /it is suggested that/gi, replacement: "suggest" },
    { regex: /it is required that/gi, replacement: "must" },
    { regex: /it is vital that/gi, replacement: "must" },
    { regex: /it is essential that/gi, replacement: "must" },
    { regex: /take into consideration/gi, replacement: "consider" },
    { regex: /take into account/gi, replacement: "consider" },
    { regex: /come to the conclusion/gi, replacement: "conclude" },
    { regex: /arrive at the conclusion/gi, replacement: "conclude" },
    { regex: /reach a decision/gi, replacement: "decide" },
    { regex: /conduct an investigation/gi, replacement: "investigate" },
    { regex: /make a recommendation/gi, replacement: "recommend" },
    { regex: /provide assistance to/gi, replacement: "help" },
    { regex: /be in a position to/gi, replacement: "can" },
    { regex: /has the capacity to/gi, replacement: "can" },
    { regex: /has the ability to/gi, replacement: "can" },
    { regex: /has the potential to/gi, replacement: "may" },
    { regex: /there is a possibility that/gi, replacement: "possibly" },
    { regex: /there is a chance that/gi, replacement: "possibly" },
    { regex: /there is a likelihood that/gi, replacement: "likely" },
    { regex: /make an adjustment to/gi, replacement: "adjust" },
    { regex: /make a decision to/gi, replacement: "decide to" },
    { regex: /give consideration to/gi, replacement: "consider" },
    { regex: /afford an opportunity/gi, replacement: "allow" },
    { regex: /at the conclusion of/gi, replacement: "after" },
    { regex: /for the duration of/gi, replacement: "during" },
    { regex: /in the absence of/gi, replacement: "without" },
    { regex: /in the presence of/gi, replacement: "with" },
    { regex: /in the vicinity of/gi, replacement: "near" },
    { regex: /in the direction of/gi, replacement: "toward" },
    { regex: /with the result that/gi, replacement: "so" },
    { regex: /with reference to/gi, replacement: "about" },
    { regex: /with regard to/gi, replacement: "about" },
    { regex: /with respect to/gi, replacement: "about" },
    { regex: /a large number of/gi, replacement: "many" },
    { regex: /a small number of/gi, replacement: "few" },
    { regex: /a significant amount of/gi, replacement: "much" },
    { regex: /a minimal amount of/gi, replacement: "little" },
    { regex: /a sufficient amount of/gi, replacement: "enough" },
    { regex: /an insufficient amount of/gi, replacement: "insufficient" },
    { regex: /in excess of/gi, replacement: "over" },
    { regex: /in addition to/gi, replacement: "besides" },
    { regex: /notwithstanding the fact that/gi, replacement: "although" },
    { regex: /with the exception of/gi, replacement: "except" },
    { regex: /in spite of the fact that/gi, replacement: "although" },
    { regex: /regardless of the fact that/gi, replacement: "although" },
    { regex: /on account of the fact that/gi, replacement: "because" },
    { regex: /on the basis of/gi, replacement: "from" },
    { regex: /on the grounds that/gi, replacement: "because" },
    { regex: /in the final analysis/gi, replacement: "finally" },
    { regex: /in a manner of speaking/gi, replacement: "" }
  ];

  // Apply all transformations

  // 1. Remove courtesy phrases
  for (const phrase of courtesyPhrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    optimized = optimized.replace(regex, "");
  }

  // 2. Remove filler words
  for (const word of fillerWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    optimized = optimized.replace(regex, "");
  }

  // 3. Replace verbose phrases
  for (const [verbose, concise] of Object.entries(verboseMap)) {
    const regex = new RegExp(`\\b${verbose}\\b`, "gi");
    optimized = optimized.replace(regex, concise);
  }

  // 4. Replace redundant phrases
  for (const phrase of redundantPhrases) {
    const words = phrase.split(" ");
    // Keep just the last word for most redundant phrases
    const replacement = words[words.length - 1];
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    optimized = optimized.replace(regex, replacement);
  }

  // 5. Apply contractions
  for (const [full, contraction] of Object.entries(contractionsMap)) {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    optimized = optimized.replace(regex, contraction);
  }

  // 6. Apply advanced replacements
  for (const { regex, replacement } of advancedReplacements) {
    optimized = optimized.replace(regex, replacement);
  }

  // 7. Try to convert passive to active voice (simple cases)
  for (const { regex, replacement } of passivePatterns) {
    optimized = optimized.replace(regex, replacement);
  }

  // 8. Extra transformations
  // Remove "that" in many contexts where it's optional
  optimized = optimized.replace(/\b(said|claimed|stated|mentioned|noted|reported|suggested|proposed|assumed|hoped|believed) that\b/gi, "$1");
  
  // Remove "the fact that" and other redundant constructions
  optimized = optimized.replace(/\bthe fact that\b/gi, "that");
  optimized = optimized.replace(/\bin fact\b/gi, "");
  optimized = optimized.replace(/\bas a result of this\b/gi, "so");
  optimized = optimized.replace(/\bbased on the fact that\b/gi, "because");

  // Replace common verbose question forms
  optimized = optimized.replace(/\bwould you be willing to\b/gi, "will you");
  optimized = optimized.replace(/\bcould you please\b/gi, "please");
  optimized = optimized.replace(/\bis there a possibility that\b/gi, "can");
  optimized = optimized.replace(/\bdo you think you could\b/gi, "can you");

  // Clean up extra whitespace and punctuation
  optimized = optimized.replace(/\s{2,}/g, " ").trim();
  optimized = optimized.replace(/\s+([,.;:])/g, "$1"); // Remove space before punctuation
  optimized = optimized.replace(/,\s*,/g, ","); // Remove double commas
  
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
