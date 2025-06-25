// Gemini service: analyze chat for transfer intent
// Usage: const result = analyzeTransferIntent(userMessage, aiResponse)
// Returns: { recipient: string, amount: number } | null

export function analyzeTransferIntent(userMessage, aiResponse) {
  // Simple regex for 'send/transfer X to Y' or 'pay Y X'
  // e.g. 'send 50 to John', 'transfer 100 to Alice', 'pay Bob 25'
  const patterns = [
    /(?:send|transfer)\s+(\d+(?:\.\d{1,2})?)\s+(?:to|for)\s+([a-zA-Z ]+)/i,
    /pay\s+([a-zA-Z ]+)\s+(\d+(?:\.\d{1,2})?)/i
  ];
  for (const pattern of patterns) {
    const match = userMessage.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        // send 50 to John
        return { amount: parseFloat(match[1]), recipient: match[2].trim() };
      } else {
        // pay John 50
        return { recipient: match[1].trim(), amount: parseFloat(match[2]) };
      }
    }
  }
  // Optionally, use aiResponse for more advanced intent detection
  return null;
} 