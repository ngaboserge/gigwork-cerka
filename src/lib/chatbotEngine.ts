// Enhanced Chatbot Intelligence Engine
// 100% Free - No API costs
// Features: Fuzzy matching, context awareness, multi-language support

import { knowledgeBase, type FAQItem } from './chatbotKnowledge';
import type { TFunction } from 'i18next';

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-1)
function similarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1.0 - distance / maxLength;
}

// Check if query is a greeting
export function isGreeting(query: string, t: TFunction): boolean {
  const lowerQuery = query.toLowerCase().trim();
  const englishGreetings = t('chatbotKnowledge.greetings.english', { returnObjects: true }) as string[];
  const kinyarwandaGreetings = t('chatbotKnowledge.greetings.kinyarwanda', { returnObjects: true }) as string[];
  const allGreetings = [...englishGreetings, ...kinyarwandaGreetings];
  
  return allGreetings.some(
    greeting => lowerQuery === greeting || lowerQuery.startsWith(greeting + ' ')
  );
}

// Enhanced matching with fuzzy search and scoring
export function findBestMatch(query: string, t: TFunction, conversationContext?: string[]): {
  faq: FAQItem | null;
  confidence: number;
  relatedFAQs: FAQItem[];
} {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(' ').filter(w => w.length > 2);
  
  interface ScoredFAQ {
    faq: FAQItem;
    score: number;
  }
  
  const scoredFAQs: ScoredFAQ[] = [];
  
  // Get translated knowledge base
  const translatedKnowledgeBase = knowledgeBase(t);
  
  for (const faq of translatedKnowledgeBase) {
    let score = 0;
    
    // 1. Exact keyword matches (highest weight)
    for (const keyword of faq.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 5;
      }
      // Fuzzy keyword matching
      for (const word of words) {
        const similarity = similarityScore(word, keyword);
        if (similarity > 0.8) {
          score += 3 * similarity;
        }
      }
    }
    
    // 2. Question similarity
    const questionSimilarity = similarityScore(lowerQuery, faq.question.toLowerCase());
    if (questionSimilarity > 0.6) {
      score += 10 * questionSimilarity;
    }
    
    // 3. Word matches in question
    for (const word of words) {
      if (faq.question.toLowerCase().includes(word)) {
        score += 2;
      }
    }
    
    // 4. Word matches in answer
    for (const word of words) {
      if (faq.answer.toLowerCase().includes(word)) {
        score += 1;
      }
    }
    
    // 5. Context bonus (if previous questions were in same category)
    if (conversationContext && conversationContext.length > 0) {
      const lastCategory = conversationContext[conversationContext.length - 1];
      if (faq.category === lastCategory) {
        score += 2;
      }
    }
    
    if (score > 0) {
      scoredFAQs.push({ faq, score });
    }
  }
  
  // Sort by score
  scoredFAQs.sort((a, b) => b.score - a.score);
  
  // Get best match
  const bestMatch = scoredFAQs[0];
  const confidence = bestMatch ? Math.min(bestMatch.score / 15, 1.0) : 0;
  
  // Get related FAQs (same category, different question)
  const relatedFAQs: FAQItem[] = [];
  if (bestMatch && confidence > 0.3) {
    const category = bestMatch.faq.category;
    relatedFAQs.push(
      ...translatedKnowledgeBase
        .filter(faq => faq.category === category && faq.question !== bestMatch.faq.question)
        .slice(0, 3)
    );
  }
  
  return {
    faq: confidence > 0.3 ? bestMatch.faq : null,
    confidence,
    relatedFAQs
  };
}

// Get random fallback response
export function getFallbackResponse(t: TFunction): string {
  const fallbacks = [
    t('chatbotKnowledge.fallback1'),
    t('chatbotKnowledge.fallback2'),
    t('chatbotKnowledge.fallback3')
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Extract category from FAQ for context
export function extractCategory(faq: FAQItem | null): string | null {
  return faq ? faq.category : null;
}

// Get suggestions based on user role
export function getRoleSuggestions(t: TFunction, userRole?: string): string[] {
  if (userRole === 'worker') {
    return [
      t('chatbotKnowledge.roleSuggestions.worker1'),
      t('chatbotKnowledge.roleSuggestions.worker2'),
      t('chatbotKnowledge.roleSuggestions.worker3'),
      t('chatbotKnowledge.roleSuggestions.worker4')
    ];
  } else if (userRole === 'employer') {
    return [
      t('chatbotKnowledge.roleSuggestions.employer1'),
      t('chatbotKnowledge.roleSuggestions.employer2'),
      t('chatbotKnowledge.roleSuggestions.employer3'),
      t('chatbotKnowledge.roleSuggestions.employer4')
    ];
  } else {
    return [
      t('chatbotKnowledge.roleSuggestions.general1'),
      t('chatbotKnowledge.roleSuggestions.general2'),
      t('chatbotKnowledge.roleSuggestions.general3'),
      t('chatbotKnowledge.roleSuggestions.general4')
    ];
  }
}

// Smart response formatting
export function formatResponse(faq: FAQItem, confidence: number, t: TFunction): string {
  let response = faq.answer;
  
  // Add category indicator
  response += '\n\n' + t('chatbotKnowledge.categoryPrefix') + faq.category;
  
  // Add confidence indicator for debugging (optional)
  if (confidence < 0.6) {
    response += '\n\n' + t('chatbotKnowledge.lowConfidenceNote');
  }
  
  return response;
}

// Generate welcome message based on user
export function getWelcomeMessage(t: TFunction, userName?: string, userRole?: string): string {
  const name = userName ? ` ${userName.split(' ')[0]}` : '';
  const roleContext = userRole === 'worker' ? t('chatbotKnowledge.welcomeWorker') :
                      userRole === 'employer' ? t('chatbotKnowledge.welcomeEmployer') :
                      t('chatbotKnowledge.welcomeGeneral');
  
  return t('chatbotKnowledge.welcomeMessageIntro') + name + t('chatbotKnowledge.welcomeMessageBody') + ' ' + roleContext + '.\n\n' + t('chatbotKnowledge.welcomeMessageTopics');
}
