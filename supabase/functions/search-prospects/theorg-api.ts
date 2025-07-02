import { TheOrgResponse, TheOrgPosition } from './types.ts';

export const searchProspects = async (theorgApiKey: string, countryCode: string, targetTitles: string[]): Promise<TheOrgPosition[]> => {
  console.log(`Searching for product leaders in country: ${countryCode}`);
  
  const requestBody = {
    limit: 10,
    offset: 0,
    filters: {
      "locations.country": [countryCode],
      "jobTitles": targetTitles,
      "departments": ["product"]
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
  console.log(`Found ${responseData.data?.length || 0} positions`);
  console.log('Response data:', JSON.stringify(responseData, null, 2));
  
  return responseData.data || [];
};