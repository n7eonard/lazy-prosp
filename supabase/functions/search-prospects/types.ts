export interface TheOrgPosition {
  id: string;
  name: string;
  title: string;
  company: {
    name: string;
    domain?: string;
  };
  location?: string;
  linkedInUrl?: string;
  profilePhotoUrl?: string;
  workEmail?: string;
  personalEmail?: string;
  phoneNumber?: string;
  startDate?: string;
}

export interface TheOrgResponse {
  data: TheOrgPosition[];
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