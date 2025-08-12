// src/screens/auth/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUpWithPhone } from '../../lib/supabase';

const SignupScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState('role-selection');
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    location: '',
    skills: [],
    language: 'en'
  });
  const [loading, setLoading] = useState(false);

  const skills = [
    'Roofing', 'Demolition', 'Cleanup', 'Electrical', 'Plumbing',
    'Flooring', 'Painting', 'Drywall', 'Concrete', 'General Labor'
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentStep('signup-form');
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    if (!formData.phone || !formData.displayName || !formData.location || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (selectedRole === 'employer' && !formData.email) {
      Alert.alert('Error', 'Email is required for employers');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await signUpWithPhone({
        role: selectedRole,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        location: formData.location,
        skills: formData.skills,
        language: formData.language
      });

      if (error) throw error;

      Alert.alert(
        'Success!', 
        'Account created successfully. Please verify your phone number.',
        [{ text: 'OK', onPress: () => setCurrentStep('phone-verification') }]
      );

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Screen
  if (currentStep === 'role-selection') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="construct" size={40} color="#F59E0B" />
            </View>
            <Text style={styles.title}>TrabajoSeguro</Text>
            <Text style={styles.subtitle}>Secure work platform</Text>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleCard, styles.employerCard]}
              onPress={() => handleRoleSelect('employer')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="briefcase" size={32} color="#3B82F6" />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>Employer</Text>
                <Text style={styles.roleSubtitle}>Post jobs & hire workers</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, styles.workerCard]}
              onPress={() => handleRoleSelect('worker')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="hammer" size={32} color="#F97316" />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>Worker</Text>
                <Text style={styles.roleSubtitle}>Find construction jobs</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.securityText}>
              Bank-level security & privacy protection
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Signup Form
  if (currentStep === 'signup-form') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setCurrentStep('role-selection')}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.formTitle}>
              Sign up as {selectedRole === 'employer' ? 'Employer' : 'Worker'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email {selectedRole === 'employer' ? '*' : '(optional)'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Minimum 8 characters"
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Re-enter password"
                secureTextEntry
              />
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {selectedRole === 'worker' ? 'Name or Alias' : 'Full Name'} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.displayName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                placeholder={selectedRole === 'worker' ? 'John S. or J.S.' : 'John Smith'}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City/Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="Newark, NJ"
              />
            </View>

            {/* Skills for Workers */}
            {selectedRole === 'worker' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Skills (select all that apply)</Text>
                <View style={styles.skillsContainer}>
                  {skills.map(skill => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        formData.skills.includes(skill) && styles.skillChipSelected
                      ]}
                      onPress={() => handleSkillToggle(skill)}
                    >
                      <Text style={[
                        styles.skillText,
                        formData.skills.includes(skill) && styles.skillTextSelected
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                selectedRole === 'employer' ? styles.employerButton : styles.workerButton
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {selectedRole === 'worker' && (
              <View style={styles.privacyNotice}>
                <Text style={styles.privacyText}>
                  🔒 We only ask for basic info. No SSN or documents required.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Phone Verification Screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Check Your Phone</Text>
        <Text style={styles.verificationSubtitle}>
          We've sent a verification link to {formData.phone}
        </Text>
        <TouchableOpacity
          style={styles.verificationButton}
          onPress={() => setCurrentStep('role-selection')}
        >
          <Text style={styles.verificationButtonText}>Back to Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  logo: { width: 80, height: 80, backgroundColor: '#FEF3C7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  roleContainer: { marginBottom: 30 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  employerCard: { borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  workerCard: { borderLeftWidth: 4, borderLeftColor: '#F97316' },
  roleIcon: { width: 60, height: 60, backgroundColor: '#F3F4F6', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  roleContent: { flex: 1 },
  roleTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  roleSubtitle: { fontSize: 14, color: '#6B7280' },
  securityNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D1FAE5' },
  securityText: { fontSize: 14, color: '#065F46', marginLeft: 8, fontWeight: '500' },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  formTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginLeft: 16 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  skillChip: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, margin: 4 },
  skillChipSelected: { backgroundColor: '#FED7AA', borderColor: '#FB923C' },
  skillText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  skillTextSelected: { color: '#C2410C' },
  submitButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  employerButton: { backgroundColor: '#3B82F6' },
  workerButton: { backgroundColor: '#F97316' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  privacyNotice: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 8, marginTop: 16 },
  privacyText: { fontSize: 12, color: '#065F46', textAlign: 'center' },
  verificationContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  verificationTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  verificationSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  verificationButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  verificationButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default SignupScreen;