import { API_BASE_URL } from './config.js';

// Chat API functions

export async function getAllChats(email) {
  const response = await fetch(`${API_BASE_URL}/api/chats?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch chats. Status: ${response.status}`);
  }

  return data;
}

export async function getChatById(id, email) {
  const response = await fetch(`${API_BASE_URL}/api/chats/${id}?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch chat. Status: ${response.status}`);
  }

  return data;
}

export async function createChat(email, userInput, adviceOutput, title = null) {
  const response = await fetch(`${API_BASE_URL}/api/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, userInput, adviceOutput, title }),
  });

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to create chat. Status: ${response.status}`);
  }

  return data;
}

export async function updateChat(id, email, userInput, adviceOutput, title = null) {
  const response = await fetch(`${API_BASE_URL}/api/chats/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, userInput, adviceOutput, title }),
  });

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to update chat. Status: ${response.status}`);
  }

  return data;
}

export async function deleteChat(id, email) {
  const response = await fetch(`${API_BASE_URL}/api/chats/${id}?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to delete chat. Status: ${response.status}`);
  }

  return data;
}

