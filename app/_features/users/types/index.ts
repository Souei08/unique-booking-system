export interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  phone_number?: string;
  supabase_id?: string;
  auth_last_sign_in_at?: string;
  auth_created_at?: string;
  email_confirmed_at?: string;
  invited_at?: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_confirm_status?: number;
  aud?: string;
  confirmed_at?: string;
  last_sign_in_with_ip?: string;
  auth_role?: string;
  auth_updated_at?: string;
}
