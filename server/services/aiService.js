import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODELS = {
  fast: 'llama-3.1-8b-instant',
  powerful: 'llama-3.3-70b-versatile',
};

// Profile-specific prompt adjustments
const profileContext = {
  adhd: 'The user has ADHD. Use extremely short, energetic sentences. Use bullet points. Keep steps under 5 minutes each. Add encouragement emojis.',
  autism: 'The user is autistic. Be very precise, literal, and clear. Avoid ambiguity. Provide structured, predictable steps. No metaphors.',
  dyslexia: 'The user has dyslexia. Use simple words. Short sentences. Clear numbered steps. Avoid complex vocabulary.',
  mixed: 'The user has mixed neurodivergent traits. Be clear, concise, and supportive. Break things into small steps.',
};

/**
 * Decompose a large task into micro-steps using Groq AI
 */
export const decomposeTask = async (taskTitle, profile = 'mixed', granularity = 'micro', category = '', description = '') => {
  const context = profileContext[profile] || profileContext.mixed;
  
  const granularityContext = {
    micro: 'Break the task into EXTREMELY small, bite-sized micro-steps. Each step should take less than 5 minutes. Perfect for managing executive dysfunction.',
    normal: 'Break the task into standard, manageable steps. Each step should take about 10-15 minutes.',
    macro: 'Focus on high-level milestones. Provide 3-4 major goals rather than tiny steps.'
  }[granularity] || 'Break the task into small, actionable steps.';

  const prompt = `${context}
${granularityContext}

CONTEXT: This task is in the category "${category}" ${description ? `and has the description: "${description}"` : ''}.

Return ONLY a JSON array of objects with this exact format:
[{"step": "step text here", "minutes": 5}, ...]

Task: "${taskTitle}"

Return only the JSON array, no other text.`;

  const response = await groq.chat.completions.create({
    model: MODELS.fast,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.trim();

  // Parse JSON safely
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format');

  return JSON.parse(jsonMatch[0]);
};

/**
 * Organize a brain dump into categorized tasks with priorities and schedule
 */
export const organizeBrainDump = async (text, profile = 'mixed', granularity = 'micro') => {
  const context = profileContext[profile] || profileContext.mixed;
  const gContext = granularity === 'micro' ? 'Break things into very small steps.' : 'Keep tasks at a higher level.';

  const prompt = `${context}
${gContext}

A neurodivergent user has done a brain dump. Organize this into a structured plan. Return ONLY a JSON object with this exact format:
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "📚",
      "tasks": [
        {"title": "Task title", "priority": "high|medium|low", "estimatedMinutes": 30}
      ]
    }
  ],
  "suggestedSchedule": [
    {"time": "Morning", "tasks": ["Task 1", "Task 2"]}
  ],
  "topPriority": "The single most important thing to do right now. MUST be one of the 'high' priority tasks if you have identified any.",
  "encouragement": "A short supportive message"
}

Brain dump: "${text}"

Return only the JSON object, no other text.`;

  const response = await groq.chat.completions.create({
    model: MODELS.powerful,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content?.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid format');

  return JSON.parse(jsonMatch[0]);
};

/**
 * AI Productivity Companion chat response
 */
export const chatResponse = async (messages, profile = 'mixed') => {
  const context = profileContext[profile] || profileContext.mixed;

  const systemMessage = `You are NeuroAssist, a caring AI productivity companion specifically designed for neurodivergent users. ${context}

Your personality:
- Warm, encouraging, never judgmental
- Celebrate small wins enthusiastically
- Never use shaming language
- Break down overwhelming feelings
- Suggest concrete next steps
- Use appropriate emojis to make text easier to parse
- Keep responses concise and scannable

You help with: task planning, focus strategies, breaking down overwhelm, motivation, and executive function support.`;

  const response = await groq.chat.completions.create({
    model: MODELS.powerful,
    messages: [
      { role: 'system', content: systemMessage },
      ...messages,
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content;
};

/**
 * Generate encouragement message for overwhelm mode
 */
export const generateEncouragement = async (profile = 'mixed') => {
  const response = await groq.chat.completions.create({
    model: MODELS.fast,
    messages: [{
      role: 'user',
      content: `Generate a very short (1-2 sentences), warm, encouraging message for a neurodivergent person who just clicked "I'm Overwhelmed". Make it feel like a gentle hug. Profile: ${profile}. Return only the message text.`,
    }],
    temperature: 0.9,
    max_tokens: 100,
  });

  return response.choices[0]?.message?.content?.trim();
};

/**
 * Refine writing based on mode (simplify, grammar, expand)
 */
export const refineWriting = async (text, mode, profile = 'mixed') => {
  const context = profileContext[profile] || profileContext.mixed;
  
  const modes = {
    simplify: `SIMPLIFY MODE:
1. Target: Someone with ${profile} traits.
2. Goal: Make text extremely easy to read.
3. Rules: Use simple words, short sentences, and clear structure.
4. Output: Return ONLY the simplified text. No conversational filler like "Here is your text".`,

    expand: `EXPAND MODE:
1. Target: Turning rough thoughts into structured writing.
2. Goal: Take fragments and make them a polished paragraph.
3. Rules: Connect ideas smoothly. Stay supportive but professional.
4. Output: Return ONLY the expanded text.`
  };

  const prompt = `INSTRUCTIONS:
${modes[mode] || modes.simplify}

NEURODIVERGENT CONTEXT (Apply tone only):
${context}

TEXT TO PROCESS:
"${text}"`;

  const response = await groq.chat.completions.create({
    model: MODELS.powerful,
    messages: [{ role: 'system', content: 'You are a writing assistant. You return ONLY the requested text without any framing, labels, or additional conversation.' }, { role: 'user', content: prompt }],
    temperature: 0.3, // Lower temperature for more consistency
    max_tokens: 1500,
  });

  let result = response.choices[0]?.message?.content?.trim();
  
  // Clean up any common AI prefixes if they slip through
  result = result.replace(/^(Here is the|Simplified text:|Refined text:|Corrected text:|Output:)\s*/i, '');
  // Remove surrounding quotes if AI adds them
  result = result.replace(/^"(.*)"$/, '$1');

  return result;
};

export default { decomposeTask, organizeBrainDump, chatResponse, generateEncouragement, refineWriting };
