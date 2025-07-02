import { TheOrgPosition } from './types.ts';

export const transformProspects = (prospects: TheOrgPosition[], countryCode: string) => {
  // Ensure prospects is an array
  if (!Array.isArray(prospects)) {
    console.error('transformProspects received non-array:', typeof prospects, prospects);
    return [];
  }
  
  return prospects.map(prospect => ({
    name: prospect.name || 'Unknown',
    title: prospect.title || 'Unknown Title',
    company: prospect.company?.name || 'Unknown Company',
    location: prospect.location || countryCode,
    avatar_url: prospect.profilePhotoUrl || null,
    linkedin_url: prospect.linkedInUrl || null,
    mutual_connections: 0, // We'll set this to 0 since we're not analyzing connections
    profile_data: {
      work_email: prospect.workEmail || null,
      personal_email: prospect.personalEmail || null,
      phone_number: prospect.phoneNumber || null,
      start_date: prospect.startDate || null,
      company_domain: prospect.company?.domain || null,
      source: 'theorg.com'
    }
  }));
};