import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/lib/api';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    dob: '',
    gender: 'male' as 'male' | 'female',
    state: '',
    city: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    // Basic validation
    if (!formData.email || !formData.password || !formData.username || !formData.firstName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // First create Supabase auth account
      await signUp(formData.email, formData.password);

      // Then register user profile
      await api.register(formData);

      Alert.alert(
        'Success',
        'Account created! Please check your email for verification.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Join HOTNOTCLUB</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 8 characters)"
            placeholderTextColor="#666"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#666"
            value={formData.username}
            onChangeText={(v) => updateField('username', v)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#666"
            value={formData.firstName}
            onChangeText={(v) => updateField('firstName', v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor="#666"
            value={formData.dob}
            onChangeText={(v) => updateField('dob', v)}
          />

          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                formData.gender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => updateField('gender', 'male')}
            >
              <Text
                style={[
                  styles.genderText,
                  formData.gender === 'male' && styles.genderTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                formData.gender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => updateField('gender', 'female')}
            >
              <Text
                style={[
                  styles.genderText,
                  formData.gender === 'female' && styles.genderTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#666"
            value={formData.state}
            onChangeText={(v) => updateField('state', v)}
          />

          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#666"
            value={formData.city}
            onChangeText={(v) => updateField('city', v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Referral Code (optional)"
            placeholderTextColor="#666"
            value={formData.referralCode}
            onChangeText={(v) => updateField('referralCode', v)}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#FFF',
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#FF1493',
    borderColor: '#FF1493',
  },
  genderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#FF1493',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#FF1493',
    fontSize: 14,
  },
});
