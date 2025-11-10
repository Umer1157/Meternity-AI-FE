import { API_BASE_URL } from './config.js';

const endpoint = `${API_BASE_URL}/api/generate`;

export async function generateAdvice(userInput) {
  console.log('Sending request to:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    cache: 'no-store',
    body: JSON.stringify({ userInput })
  });

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  // Get response text first to see what we're getting
  const responseText = await response.text();
  console.log('Response text:', responseText);

  // Try to parse as JSON
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Response was not valid JSON:', responseText);
    throw new Error('Invalid response from server');
  }

  console.log('Parsed data:', data);

  // Check for errors in response
  if (!response.ok) {
    console.error('API error:', data);
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  // Check if advice is available
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    console.error('No candidates in response:', data);
    throw new Error("Sorry, I couldn't generate advice. Please try again.");
  }
}

