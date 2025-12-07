import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign in
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to main app
      router.replace('/(tabs)/compete');
    } else if (user && !inAuthGroup && segments.length === 0) {
      // Initial load with authenticated user
      router.replace('/(tabs)/compete');
    } else if (!user && !inAuthGroup && segments.length === 0) {
      // Initial load without user
      router.replace('/(auth)/sign-in');
    }
  }, [user, loading, segments]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF1493" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
