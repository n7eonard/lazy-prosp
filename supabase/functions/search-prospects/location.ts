import { User } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export const extractCountryCode = (user: User): string => {
  let countryCode = 'US'; // Default fallback
  
  console.log('User metadata:', user.user_metadata);
  
  // Try to extract country code from user metadata
  if (user.user_metadata?.country) {
    const country = user.user_metadata.country.toLowerCase();
    // Map common country names to ISO codes
    const countryMap: { [key: string]: string } = {
      'united states': 'US',
      'canada': 'CA',
      'united kingdom': 'GB',
      'germany': 'DE',
      'france': 'FR',
      'spain': 'ES',
      'italy': 'IT',
      'netherlands': 'NL',
      'australia': 'AU',
      'india': 'IN',
      'singapore': 'SG',
      'japan': 'JP',
      'brazil': 'BR',
      'mexico': 'MX'
    };
    countryCode = countryMap[country] || user.user_metadata.country.slice(0, 2).toUpperCase();
  } else if (user.user_metadata?.locale) {
    // Extract from locale like "en_US"
    const localeParts = user.user_metadata.locale.split('_');
    if (localeParts.length > 1) {
      countryCode = localeParts[1];
    }
  }

  console.log(`Country code determined: ${countryCode}`);
  return countryCode;
};