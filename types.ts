export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Lead {
  name: string;
  address: string;
  website?: string;
  email?: string;
  phone?: string;
  type?: string;
  rating?: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isError?: boolean;
  timestamp: number;
  groundingSources?: GroundingSource[];
  relatedLeads?: Lead[]; // If the message generated leads
  image?: string; // base64
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export interface SearchParams {
  query: string;
  location: string;
  radius: number; // in km
}