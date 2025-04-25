/**
 * tokenService.ts
 * Service for optimizing text to reduce token usage in LLM requests
 */

/**
 * Main function to optimize text for token reduction
 */
export const optimizeTokens = (text: string): string => {
  let optimized = text;
  
  // 1. Remove courtesy phrases
  optimized = removeCourtesyPhrases(optimized);
  
  // 2. Apply contraction rules
  optimized = applyContractions(optimized);
  
  // 3. Replace verbose phrases
  optimized = replaceVerbosePhrases(optimized);
  
  // 4. Remove filler words
  optimized = removeFillerWords(optimized);
  
  // 5. Fix spacing and punctuation
  optimized = cleanupText(optimized);
  
  return optimized;
};

/**
 * Remove courtesy phrases that add little semantic value
 */
const removeCourtesyPhrases = (text: string): string => {
  const courtesyPhrases = [
    /\bplease\b/gi,
    /\bthank you\b/gi,
    /\bthanks\b/gi,
    /\bi would like you to\b/gi,
    /\bcould you\b/gi, 
    /\bwould you\b/gi,
    /\bkindly\b/gi,
    /\bif you don['']t mind\b/gi,
    /\bif possible\b/gi,
    /\bi was wondering if\b/gi,
    /\bi would appreciate if\b/gi,
    /\bit would be great if\b/gi,
  ];
  
  let result = text;
  courtesyPhrases.forEach(phrase => {
    result = result.replace(phrase, '');
  });
  
  return result;
};

/**
 * Apply common contractions to reduce token count
 */
const applyContractions = (text: string): string => {
  const contractions: {[key: string]: string} = {
    'i am': "I'm",
    'you are': "you're",
    'we are': "we're",
    'they are': "they're",
    'it is': "it's",
    'that is': "that's",
    'who is': "who's",
    'what is': "what's",
    'where is': "where's",
    'when is': "when's",
    'why is': "why's",
    'how is': "how's",
    'i have': "I've",
    'you have': "you've",
    'we have': "we've",
    'they have': "they've",
    'i would': "I'd",
    'you would': "you'd",
    'he would': "he'd",
    'she would': "she'd",
    'it would': "it'd",
    'we would': "we'd",
    'they would': "they'd",
    'i will': "I'll",
    'you will': "you'll",
    'he will': "he'll",
    'she will': "she'll",
    'it will': "it'll",
    'we will': "we'll",
    'they will': "they'll",
    'cannot': "can't",
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'has not': "hasn't",
    'have not': "haven't",
    'had not': "hadn't",
    'is not': "isn't",
    'are not': "aren't",
    'was not': "wasn't",
    'were not': "weren't",
    'should not': "shouldn't",
    'would not': "wouldn't",
    'could not': "couldn't",
    'will not': "won't",
    'must not': "mustn't"
  };
  
  let result = text.toLowerCase();
  
  // Apply contractions with word boundary checks
  Object.entries(contractions).forEach(([full, contracted]) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, contracted);
  });
  
  return result;
};

/**
 * Replace verbose phrases with shorter alternatives
 */
const replaceVerbosePhrases = (text: string): string => {
  const replacements: {[key: string]: string} = {
    'in order to': 'to',
    'for the purpose of': 'for',
    'due to the fact that': 'because',
    'in spite of the fact that': 'although',
    'with regard to': 'about',
    'in relation to': 'about',
    'with reference to': 'about',
    'in the event that': 'if',
    'under the circumstances that': 'if',
    'in the near future': 'soon',
    'at this point in time': 'now',
    'at the present time': 'now',
    'it is important to note that': '',
    'it should be noted that': '',
    'it is worth noting that': '',
    'as a matter of fact': 'actually',
    'in my opinion': '',
    'i think that': '',
    'i believe that': '',
    'for the most part': 'mostly',
    'a large number of': 'many',
    'a majority of': 'most',
    'a significant number of': 'many',
    'on the grounds that': 'because',
    'in light of the fact that': 'because',
    'on the basis of': 'from',
    'with the exception of': 'except',
    'in the process of': 'while',
    'for the reason that': 'because',
    'in the vicinity of': 'near',
    'in close proximity to': 'near',
    'until such time as': 'until',
    'for the foreseeable future': 'indefinitely',
    'it is possible that': 'possibly',
    'there is a chance that': 'possibly',
    'has the ability to': 'can',
    'is able to': 'can',
    'has the capacity to': 'can',
    'in a timely manner': 'promptly',
    'in an effort to': 'to',
    'in an attempt to': 'to',
    'at the conclusion of': 'after',
    'in the aftermath of': 'after',
    'during the course of': 'during',
    'is indicative of': 'indicates',
    'on a regular basis': 'regularly',
    'on numerous occasions': 'often',
    'take action to': '',
    'make a decision to': 'decide to',
    'come to a conclusion': 'conclude',
    'draw a conclusion': 'conclude',
    'reach a conclusion': 'conclude',
    'make an adjustment to': 'adjust',
    'provide an explanation for': 'explain',
    'come to a realization': 'realize',
    'take into consideration': 'consider',
    'conduct an investigation': 'investigate',
    'provide assistance to': 'help',
    'give consideration to': 'consider',
    'make a recommendation': 'recommend',
    'provide a description of': 'describe',
    'reach an agreement': 'agree',
    'have a discussion about': 'discuss',
    'make a statement': 'state',
    'make an announcement': 'announce',
    'have a tendency to': 'tend to',
    'for all intents and purposes': 'essentially',
    'at the end of the day': 'ultimately',
    'when all is said and done': 'ultimately',
    'needless to say': '',
    'the fact of the matter is': '',
    'as a general rule': 'generally',
    'by the same token': 'similarly',
    'the vast majority of': 'most',
    'be that as it may': 'however',
    'few and far between': 'rare',
    'from time to time': 'occasionally',
    'in this day and age': 'now',
    'in due course': 'eventually',
    'to all intents and purposes': 'effectively',
  };
  
  let result = text;
  
  Object.entries(replacements).forEach(([verbose, concise]) => {
    const regex = new RegExp(`\\b${verbose}\\b`, 'gi');
    result = result.replace(regex, concise);
  });
  
  return result;
};

/**
 * Remove filler words that add little semantic value
 */
const removeFillerWords = (text: string): string => {
  const fillerWords = [
    /\bbasically\b/gi,
    /\bliterally\b/gi,
    /\bactually\b/gi,
    /\breally\b/gi,
    /\bfrankly\b/gi,
    /\bhonestly\b/gi,
    /\bquite\b/gi,
    /\bjust\b/gi,
    /\bvery\b/gi,
    /\bquite\b/gi,
    /\bsomewhat\b/gi,
    /\bessentially\b/gi,
    /\bgreatly\b/gi,
    /\bmuch\b/gi,
    /\bcertainly\b/gi,
    /\bdefinitely\b/gi,
    /\bprobably\b/gi,
    /\bmaybe\b/gi,
    /\bperhaps\b/gi,
    /\bpossibly\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bI mean\b/gi,
    /\bobviously\b/gi,
  ];
  
  let result = text;
  fillerWords.forEach(word => {
    result = result.replace(word, '');
  });
  
  return result;
};

/**
 * Clean up extra spaces and fix punctuation
 */
const cleanupText = (text: string): string => {
  let result = text;
  
  // Fix multiple spaces
  result = result.replace(/\s+/g, ' ');
  
  // Fix spacing around punctuation
  result = result.replace(/\s([,.!?:;])/g, '$1');
  
  // Remove spaces at the beginning and end
  result = result.trim();
  
  return result;
};

/**
 * Roughly estimate token count using the typical 4 chars/token rule
 * For a more accurate count, use a tokenizer library specific to your LLM
 */
export const estimateTokenCount = (text: string): number => {
  // Rough estimate: 4 characters per token on average for English text
  return Math.ceil(text.length / 4);
};