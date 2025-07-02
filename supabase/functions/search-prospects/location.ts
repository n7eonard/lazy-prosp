import { User } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export const extractCountryCode = (user: User): string => {
  let countryCode = 'US'; // Default fallback
  
  console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2));
  
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
  } else if (user.user_metadata?.location) {
    // Check for location field that might contain city, country info
    const location = user.user_metadata.location.toLowerCase();
    console.log('Found location field:', location);
    
    if (location.includes('spain') || location.includes('españa')) {
      countryCode = 'ES';
    } else if (location.includes('barcelona')) {
      countryCode = 'ES'; // Barcelona is in Spain
    } else if (location.includes('france')) {
      countryCode = 'FR';
    } else if (location.includes('germany')) {
      countryCode = 'DE';
    } else if (location.includes('italy')) {
      countryCode = 'IT';
    } else if (location.includes('netherlands')) {
      countryCode = 'NL';
    } else if (location.includes('canada')) {
      countryCode = 'CA';
    } else if (location.includes('australia')) {
      countryCode = 'AU';
    }
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