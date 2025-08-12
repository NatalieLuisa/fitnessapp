// src/lib/supabase.js - TEMPORARY FIX for testing
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// TEMPORARY: Sign up with email instead of phone for testing
export const signUpWithPhone = async (userData) => {
  const { role, phone, email, password, displayName, location, skills, language } = userData;
  
  try {
    // Use email signup if email is provided, otherwise use a temp email
    const signupEmail = email || `${phone.replace(/\D/g, '')}@temp.test`;
    
    // Step 1: Create auth user with EMAIL (temporary)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signupEmail,  // Using email instead of phone for now
      password: password,
      options: {
        data: {
          role: role,
          display_name: displayName,
          location: location,
          language: language || 'en'
        }
      }
    });

    if (authError) throw authError;

    // Step 2: Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          role: role,
          phone: phone,
          email: signupEmail,
          display_name: displayName,
          location: location,
          language_preference: language || 'en'
        }
      ]);

    if (profileError) throw profileError;

    // Step 3: Update worker skills if applicable
    if (role === 'worker' && skills && skills.length > 0) {
      const { error: skillsError } = await supabase
        .from('worker_profiles')
        .update({ skills: skills })
        .eq('user_id', authData.user.id);

      if (skillsError) throw skillsError;
    }

    return { data: authData, error: null };
    
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error: error };
  }
};

// Sign in with email (temporary)
export const signInWithPhone = async (phone, password) => {
  try {
    // For testing, we'll look up the user by phone to get their email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('phone', phone)
      .single();

    if (userError || !userData) {
      throw new Error('User not found with that phone number');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    });

    if (error) throw error;

    return { data, error: null };
    
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error: error };
  }
};