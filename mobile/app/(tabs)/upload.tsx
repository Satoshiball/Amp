import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';

export default function Upload() {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: competition } = useQuery({
    queryKey: ['upcoming-competition'],
    queryFn: () => api.getUpcomingCompetition(),
  });

  const submitMutation = useMutation({
    mutationFn: ({ competitionId, photoUrl }: { competitionId: string; photoUrl: string }) =>
      api.submitEntry(competitionId, photoUrl),
    onSuccess: () => {
      Alert.alert('Success', 'Your entry has been submitted!');
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: ['upcoming-competition'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to submit entry');
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage || !competition?.data?.id) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // In a real app, you would upload the image to storage here
    // For now, we'll use the local URI (this won't work in production)
    // TODO: Implement actual image upload to Supabase Storage or GCS

    submitMutation.mutate({
      competitionId: competition.data.id,
      photoUrl: selectedImage, // This should be the uploaded URL
    });
  };

  const hasEntry = !!competition?.data?.userEntry;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter Competition</Text>
        <Text style={styles.subtitle}>
          Week of {competition?.data?.weekLabel || 'Loading...'}
        </Text>
        <Text style={styles.prize}>
          Est. Jackpot: ${competition?.data?.jackpotAmount || '0.00'}
        </Text>
      </View>

      <View style={styles.content}>
        {selectedImage || hasEntry ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage || competition?.data?.userEntry?.photoUrl }}
              style={styles.preview}
              resizeMode="cover"
            />

            {hasEntry && !selectedImage && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#00FF00" />
                <Text style={styles.statusText}>Entry Submitted</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={80} color="#666" />
            <Text style={styles.placeholderText}>
              Select a photo to enter the competition
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {!selectedImage && (
            <>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedImage && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                    <Text style={styles.buttonText}>
                      {hasEntry ? 'Update Entry' : 'Submit Entry'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#FFF" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Entry Requirements:</Text>
          <Text style={styles.infoText}>• You must be 18 or older</Text>
          <Text style={styles.infoText}>• No nudity or explicit content</Text>
          <Text style={styles.infoText}>• One entry per week</Text>
          <Text style={styles.infoText}>• Entry fee: $1.99 (one-time) or $1.50/week (subscription)</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  prize: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#00FF00',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    aspectRatio: 3 / 4,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF1493',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#00FF00',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    color: '#FF1493',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 5,
  },
});
