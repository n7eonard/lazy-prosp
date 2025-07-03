import { TheOrgResponse, TheOrgPosition } from './types.ts';

export const searchProspects = async (theorgApiKey: string, countryCode: string, targetTitles: string[], searchSession?: number): Promise<TheOrgPosition[]> => {
  console.log(`Searching for product leaders in country: ${countryCode}`);
  
  // Create variation in results to avoid user fatigue
  // Use a combination of random offset and search session to vary results
  const baseOffset = searchSession ? (searchSession * 3) % 15 : 0; // Rotate through different starting points
  const randomOffset = Math.floor(Math.random() * 5); // Add some randomness
  const finalOffset = baseOffset + randomOffset;
  
  console.log(`Search session: ${searchSession}, Base offset: ${baseOffset}, Random offset: ${randomOffset}, Final offset: ${finalOffset}`);
  
  const requestBody = {
    limit: 8, // Increased limit to get more variety
    offset: finalOffset,
    filters: {
      "departments": ["product"],
      "locations": [{"country": countryCode}]
    }
  };
  
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch('https://api.theorg.com/v1/positions', {
    method: 'POST',
    headers: {
      'X-Api-Key': theorgApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log(`Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API request failed:`, response.status, response.statusText, errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const responseData: TheOrgResponse = await response.json();
  console.log(`API Response type: ${typeof responseData}`);
  console.log(`Response items array length: ${responseData.data?.items?.length || 'N/A'}`);
  
  let prospects = responseData.data?.items || [];
  
  // Shuffle the results to add more randomness
  for (let i = prospects.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prospects[i], prospects[j]] = [prospects[j], prospects[i]];
  }
  
  // Limit to 6 final results to maintain UI consistency
  prospects = prospects.slice(0, 6);
  
  console.log(`Returning ${prospects.length} randomized prospects`);
  return prospects;
};