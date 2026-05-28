/**
 * Utility to interact with Google Gemini 2.5 Flash via REST API
 */
export async function callGemini({ prompt, systemPrompt, customApiKey }) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server, and no client key was provided.')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  }

  if (systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }]
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API REST error:', errorText)
    throw new Error(`Gemini API error: ${response.status} - ${errorText || response.statusText}`)
  }

  const data = await response.json()
  
  // Extract text response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini API returned an empty response.')
  }

  return text
}
