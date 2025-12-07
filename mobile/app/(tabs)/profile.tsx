import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/lib/api';

export default function Profile() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    walletAddressUsdc: user?.walletAddressUsdc || '',
  });

  const { data: referralData } = useQuery({
    queryKey: ['referral-code'],
    queryFn: () => api.getReferralCode(),
  });

  const { data: boostData } = useQuery({
    queryKey: ['boost-balance'],
    queryFn: () => api.getBoostBalance(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data),
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated!');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#FF1493" />
          </View>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.name}>{user?.firstName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="flash" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{boostData?.data?.balance || 0}</Text>
            <Text style={styles.statLabel}>Boosts</Text>
          </View>
        </View>

        {/* Referral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Code</Text>
          <View style={styles.referralContainer}>
            <Text style={styles.referralCode}>
              {referralData?.data?.code || 'Loading...'}
            </Text>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color="#FF1493" />
            </TouchableOpacity>
          </View>
          <Text style={styles.referralText}>
            Invite friends and earn 1 free boost when they make their first entry!
          </Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editButton}>
                {editing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Bio</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.bio}
                onChangeText={(v) => setFormData(prev => ({ ...prev, bio: v }))}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#666"
                multiline
              />
            ) : (
              <Text style={styles.value}>{user?.bio || 'No bio yet'}</Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{user?.city}, {user?.state}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>USDC Wallet Address</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.walletAddressUsdc}
                onChangeText={(v) => setFormData(prev => ({ ...prev, walletAddressUsdc: v }))}
                placeholder="Enter your USDC wallet address"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.value}>
                {user?.walletAddressUsdc || 'Not set'}
              </Text>
            )}
          </View>

          {editing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={updateMutation.isPending}
            >
              <Text style={styles.saveButtonText}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF1493" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  name: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editButton: {
    color: '#FF1493',
    fontSize: 16,
  },
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  copyButton: {
    padding: 5,
  },
  referralText: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#FFF',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF1493',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF1493',
    borderRadius: 10,
  },
  signOutText: {
    color: '#FF1493',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
