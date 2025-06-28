// Gemini service: analyze chat for action category and extract details
// Usage: const result = parseGeminiResponse(aiResponse)
// Returns: { category: 'transfer'|'analysis'|'normal', content: string, transfer?: {...}, analysis?: {...} }

export function parseGeminiResponse(aiResponse) {
  // Try to parse the response as JSON
  try {
    // If the response is wrapped in code block, remove it
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }
    const obj = JSON.parse(jsonStr);
    if (obj && obj.category) {
      // Return the parsed object as is, for category-based handling
      return obj;
    }
  } catch (e) {
    // Parsing failed, fall through to normal
  }
  // Fallback: treat as normal
  return {
    category: 'normal',
    content: aiResponse
  };
}

// Gemini service: extract transfer details from user message
// Usage: const result = extractTransferDetails(userMessage)
// Returns: { isTransfer: boolean, fields: {...}, missing: [fieldName, ...] }

export function extractTransferDetails(userMessage) {
  // Regex patterns for extraction
  const amountPattern = /(RM|MYR|rm|myr)?\s*([0-9]+(?:\.[0-9]{1,2})?)/;
  const accountPattern = /(account|acct|acc|a\/c)[^0-9]*([0-9]{6,20})/i;
  const bankPattern = /(maybank|cimb|public bank|rhb|ambank|hong leong|bank islam|uob|ocbc|hsbc|alliance|affin|bank rakyat|bsn|bank muamalat|standard chartered|agrobank)/i;
  const recipientPattern = /to\s+([A-Za-z'\- ]+)/i;

  // Lowercase for easier matching
  const msg = userMessage;
  let recipientName = '';
  let bankName = '';
  let accountNumber = '';
  let amount = '';
  let fromRegion = '';
  let toRegion = '';

  // Amount
  const amountMatch = msg.match(amountPattern);
  if (amountMatch) {
    amount = amountMatch[0].replace(/\s+/g, '');
  }

  // Account number
  const accountMatch = msg.match(accountPattern);
  if (accountMatch) {
    accountNumber = accountMatch[2];
  }

  // Bank name
  const bankMatch = msg.match(bankPattern);
  if (bankMatch) {
    bankName = bankMatch[0];
  }

  // Recipient name (after 'to')
  const recipientMatch = msg.match(recipientPattern);
  if (recipientMatch) {
    recipientName = recipientMatch[1].trim();
    // Remove trailing bank/account info if present
    recipientName = recipientName.replace(/(maybank|cimb|public bank|rhb|ambank|hong leong|bank islam|uob|ocbc|hsbc|alliance|affin|bank rakyat|bsn|bank muamalat|standard chartered|agrobank).*/i, '').trim();
  }

  // Check if this is a transfer intent
  const isTransfer = /transfer|send|pay/i.test(msg) && (recipientName || bankName || accountNumber || amount);

  // Collect missing fields
  const missing = [];
  if (!recipientName) missing.push('recipientName');
  if (!bankName) missing.push('bankName');
  if (!accountNumber) missing.push('accountNumber');
  if (!amount) missing.push('amount');

  return {
    isTransfer,
    fields: {
      recipientName,
      bankName,
      accountNumber,
      amount,
      fromRegion,
      toRegion
    },
    missing
  };
} 