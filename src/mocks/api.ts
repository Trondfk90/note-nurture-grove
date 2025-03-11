
// Mock API middleware setup
import { callAzureAI } from '../services/azureAIService';

// Intercept fetch requests to the mock API endpoints
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = input.toString();
  
  // Mock Azure AI API
  if (url.includes('/api/azure-ai')) {
    console.log('Intercepting Azure AI API call');
    const body = init?.body ? JSON.parse(init.body.toString()) : {};
    const response = await callAzureAI(body);
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => response
    } as Response);
  }
  
  // For all other requests, use the original fetch
  return originalFetch.apply(window, [input, init]);
};

// Initialize the mock API
export const initMockAPI = () => {
  console.log('Mock API initialized');
};
