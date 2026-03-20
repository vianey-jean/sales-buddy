export const NOTE_COLORS = [
  '#ffffff', '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3', '#f3e8ff',
  '#fed7aa', '#ccfbf1', '#e0e7ff', '#fecaca'
];

export const COLUMN_COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#06b6d4'
];

// Smart voice punctuation replacements (French)
export const VOICE_REPLACEMENTS: [RegExp, string][] = [
  [/\bpoint\b/gi, '. '],
  [/\bvirgule\b/gi, ', '],
  [/\bpoint d'interrogation\b/gi, '? '],
  [/\bpoint d'exclamation\b/gi, '! '],
  [/\bdeux points\b/gi, ': '],
  [/\bpoint-virgule\b/gi, '; '],
  [/\bouvrante parenthèse\b/gi, '('],
  [/\bfermante parenthèse\b/gi, ')'],
  [/\bguillemets?\b/gi, '"'],
  [/\bà la ligne\b/gi, '\n'],
  [/\bretour à la ligne\b/gi, '\n'],
  [/\bnouvelle ligne\b/gi, '\n'],
  [/\btabulation\b/gi, '\t'],
  [/\btiret\b/gi, '- '],
  [/\bapostrophe\b/gi, "'"],
  [/\btrois points\b/gi, '... '],
  [/\bpoints de suspension\b/gi, '... '],
];

export const applySmartPunctuation = (text: string): string => {
  let result = text;
  for (const [pattern, replacement] of VOICE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Clean up multiple spaces
  result = result.replace(/  +/g, ' ');
  // Capitalize after sentence-ending punctuation
  result = result.replace(/([.!?]\s+)([a-zàâäéèêëïîôùûüÿç])/g, (_, p, c) => p + c.toUpperCase());
  return result;
};
