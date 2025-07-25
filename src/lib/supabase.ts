import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'client' | 'admin' | 'model';
  is_verified: boolean;
  avatar_url?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  preferences: Record<string, any>;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  user_id?: string;
  stage_name: string;
  age: number;
  location: string;
  category: 'Profissional' | 'Experiente' | 'Premium' | 'Exclusiva' | 'VIP' | 'Elite';
  bio?: string;
  main_photo_url?: string;
  gallery_photos: string[];
  specialties: string[];
  languages: string[];
  hourly_rate?: number;
  availability: string;
  availability_schedule: Record<string, any>;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_documents: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'standard' | 'premium' | 'vip' | 'exclusive';
  base_price?: number;
  duration_hours: number;
  is_active: boolean;
  requirements: string[];
  includes: string[];
  created_at: string;
}

export interface ModelService {
  id: string;
  model_id: string;
  service_id: string;
  custom_price?: number;
  custom_duration?: number;
  is_available: boolean;
  special_notes?: string;
  created_at: string;
  service?: Service;
}

export interface Candidatura {
  id: string;
  nome: string;
  idade: number;
  pais: string;
  provincia: string;
  cidade?: string;
  email: string;
  whatsapp: string;
  instagram?: string;
  foto_url?: string;
  fotos_adicionais: string[];
  experiencia?: string;
  motivacao?: string;
  disponibilidade?: string;
  expectativas_financeiras?: string;
  termos_aceitos: boolean;
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'entrevista_agendada';
  observacoes?: string;
  admin_notes?: string;
  interview_date?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  model_id: string;
  service_id?: string;
  booking_date: string;
  duration_hours: number;
  total_amount: number;
  deposit_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  special_requests?: string;
  location?: string;
  meeting_point?: string;
  client_notes?: string;
  model_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  confirmed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  model?: Model;
  service?: Service;
  client?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Review {
  id: string;
  client_id: string;
  model_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  pros: string[];
  cons: string[];
  is_anonymous: boolean;
  is_verified: boolean;
  is_featured: boolean;
  admin_approved: boolean;
  response_from_model?: string;
  response_date?: string;
  created_at: string;
  client?: User;
  model?: Model;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'message' | 'review';
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  expires_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  amount: number;
  currency: string;
  payment_method: 'mpesa' | 'bank_transfer' | 'cash' | 'card';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  external_reference?: string;
  payment_data: Record<string, any>;
  processed_at?: string;
  created_at: string;
}