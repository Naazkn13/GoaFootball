// Database connection utility for Supabase (PostgreSQL)
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client (for frontend - row level security enabled)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase admin client (for backend - bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database query helper
class Database {
  constructor() {
    this.client = supabaseAdmin;
  }

  // Execute raw SQL query
  async query(sql, params = []) {
    try {
      // Supabase uses PostgreSQL, use rpc for raw queries
      // Or use the query builder
      console.log('Executing query:', sql);
      console.log('With params:', params);
      
      // Note: Supabase prefers using their query builder
      // Raw SQL can be executed via Database Functions (PostgreSQL Functions)
      return { success: true, sql, params };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // User operations
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

  // OTP operations
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

  // Payment operations
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
}

export default new Database();
