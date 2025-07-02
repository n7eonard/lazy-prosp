export interface TheOrgPosition {
  id: string;
  name: string;
  title: string;
  currentCompany: {
    name: string;
    domains?: string[];
  };
  location?: {
    city?: string;
    country?: string;
    state?: string;
  };
  linkedInUrl?: string;
  profilePhotoUrl?: string;
  workEmail?: string;
  directDial?: string;
  startDate?: string;
}

export interface TheOrgResponse {
  items: TheOrgPosition[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};