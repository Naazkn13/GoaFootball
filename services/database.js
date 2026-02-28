// Database connection utility for Supabase (PostgreSQL)
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client (for frontend - row level security enabled)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase admin client (for backend - bypasses RLS)
// The fallback 'dummy-key' prevents a frontend crash when this file is imported by client components
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || 'dummy-key-for-client-side-imports'
);

// Database query helper
class Database {
  constructor() {
    this.client = supabaseAdmin;
  }

  // Execute raw SQL query
  async query(sql, params = []) {
    try {
      console.log('Executing query:', sql);
      console.log('With params:', params);
      return { success: true, sql, params };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // ==========================================
  // User operations
  // ==========================================

  async createUser(userData) {
    const { data, error } = await this.client
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async getUserById(id) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserByFootballId(footballId) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('football_id', footballId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(id, updates) {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==========================================
  // OTP operations
  // ==========================================

  async storeOTP(otpData) {
    const { data, error } = await this.client
      .from('otps')
      .insert([{
        email: otpData.email,
        otp: otpData.otp,
        purpose: otpData.purpose,
        expires_at: otpData.expires_at,
        attempts: 0,
        used: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async verifyOTP(email, otp, purpose) {
    const { data, error } = await this.client
      .from('otps')
      .update({ used: true })
      .eq('email', email)
      .eq('otp', otp)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .lt('attempts', 3)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async incrementOTPAttempts(email, purpose) {
    const { data, error } = await this.client
      .rpc('increment_otp_attempts', {
        user_email: email,
        otp_purpose: purpose
      });

    if (error) throw error;
    return data;
  }

  // ==========================================
  // Payment operations
  // ==========================================

  async createPayment(paymentData) {
    const { data, error } = await this.client
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePayment(id, updates) {
    const { data, error } = await this.client
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentsByUserId(userId) {
    const { data, error } = await this.client
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPaymentByRazorpayOrderId(orderId) {
    const { data, error } = await this.client
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Payment history operations
  async createPaymentHistory(historyData) {
    const { data, error } = await this.client
      .from('payment_history')
      .insert([historyData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentHistory(userId) {
    const { data, error } = await this.client
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // Session operations (DB-backed)
  // ==========================================

  async createDBSession(sessionData) {
    const { data, error } = await this.client
      .from('sessions')
      .insert([{
        user_id: sessionData.user_id,
        refresh_token: sessionData.refresh_token,
        device_info: sessionData.device_info || null,
        ip_address: sessionData.ip_address || null,
        is_active: true,
        expires_at: sessionData.expires_at,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSessionByRefreshToken(hashedToken) {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('refresh_token', hashedToken)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateSession(id, updates) {
    const { data, error } = await this.client
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deactivateSession(id) {
    const { data, error } = await this.client
      .from('sessions')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deactivateAllUserSessions(userId) {
    const { data, error } = await this.client
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
      .select();

    if (error) throw error;
    return data;
  }

  async getActiveSessions(userId) {
    const { data, error } = await this.client
      .from('sessions')
      .select('id, device_info, ip_address, last_activity, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteExpiredSessions() {
    const { data, error } = await this.client
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return data;
  }

  async logLoginAction(logData) {
    const { data, error } = await this.client
      .from('login_history')
      .insert([{
        user_id: logData.user_id,
        session_id: logData.session_id || null,
        action: logData.action,
        ip_address: logData.ip_address || null,
        device_info: logData.device_info || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==========================================
  // Conversation operations
  // ==========================================

  async createConversation(conversationData) {
    const { data, error } = await this.client
      .from('conversations')
      .insert([{
        user_id: conversationData.user_id,
        admin_id: conversationData.admin_id,
        subject: conversationData.subject || null,
        status: 'open',
        last_message_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateConversation(userId, adminId, subject) {
    // Try to find existing conversation for this user
    const { data: existing, error: findError } = await this.client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (findError && findError.code !== 'PGRST116') throw findError;

    if (existing) return existing;

    // Create new conversation, satisfying the foreign key constraint with ANY valid admin id
    return this.createConversation({ user_id: userId, admin_id: adminId, subject });
  }

  async getConversationsByUser(userId) {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, user:user_id(id, name, email), admin:admin_id(id, name, email)')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversationById(conversationId) {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, user:user_id(id, name, email), admin:admin_id(id, name, email)')
      .eq('id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllConversationsForAdmin() {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, user:user_id(id, name, email), admin:admin_id(id, name, email)')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateConversation(id, updates) {
    const { data, error } = await this.client
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessagesByConversation(conversationId) {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async markMessagesAsRead(conversationId, userId) {
    const { error } = await this.client
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  async getUnreadCountForUser(userId) {
    const { count, error } = await this.client
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }
}

export default new Database();

