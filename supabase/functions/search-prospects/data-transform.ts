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
    company: prospect.currentCompany?.name || 'Unknown Company',
    location: prospect.location ? `${prospect.location.city || ''}, ${prospect.location.country || countryCode}`.trim().replace(/^,\s*/, '') : countryCode,
    avatar_url: prospect.profilePhotoUrl || null,
    linkedin_url: prospect.linkedInUrl || null,
    mutual_connections: 0, // We'll set this to 0 since we're not analyzing connections
    profile_data: {
      work_email: prospect.workEmail || null,
      phone_number: prospect.directDial || null,
      start_date: prospect.startDate || null,
      company_domains: prospect.currentCompany?.domains || null,
      source: 'theorg.com'
    }
  }));
};