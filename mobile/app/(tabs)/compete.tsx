import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';

export default function Compete() {
  const queryClient = useQueryClient();
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

  const { data: competition } = useQuery({
    queryKey: ['current-competition'],
    queryFn: () => api.getCurrentCompetition(),
  });

  const { data: nextEntry, isLoading, refetch } = useQuery({
    queryKey: ['next-entry', competition?.data?.id],
    queryFn: () => api.getNextEntry(competition?.data?.id),
    enabled: !!competition?.data?.id,
  });

  const voteMutation = useMutation({
    mutationFn: ({ entryId, type }: { entryId: string; type: 'hottie' | 'nottie' }) =>
      api.vote(entryId, type),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to vote');
    },
  });

  const handleVote = (type: 'hottie' | 'nottie') => {
    if (!nextEntry?.data?.entry) return;

    voteMutation.mutate({
      entryId: nextEntry.data.entry.id,
      type,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF1493" />
      </SafeAreaView>
    );
  }

  if (!nextEntry?.data?.entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#FF1493" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            You've voted on all available entries. Check back later!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const entry = nextEntry.data.entry;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HOTNOTCLUB</Text>
        <Text style={styles.jackpot}>
          Jackpot: ${competition?.data?.jackpotAmount || '0.00'}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{ uri: entry.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />

          <View style={styles.infoOverlay}>
            <Text style={styles.name}>
              {entry.user.firstName}, {entry.ageAtEntry}
            </Text>
            <Text style={styles.location}>
              {entry.citySnapshot}, {entry.stateSnapshot}
            </Text>
            <Text style={styles.score}>
              Score: {entry.finalScore} ({entry.hottieVotes}🔥 / {entry.nottieVotes}❄️ / {entry.boostCount}⚡)
            </Text>
          </View>
        </View>
      </View>

      {/* Voting Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.voteButton, styles.nottieButton]}
          onPress={() => handleVote('nottie')}
          disabled={voteMutation.isPending}
        >
          <Ionicons name="close-circle" size={60} color="#666" />
          <Text style={styles.buttonLabel}>NOTTIE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.voteButton, styles.hottieButton]}
          onPress={() => handleVote('hottie')}
          disabled={voteMutation.isPending}
        >
          <Ionicons name="heart-circle" size={60} color="#FF1493" />
          <Text style={styles.buttonLabel}>HOTTIE</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  jackpot: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  location: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 5,
  },
  score: {
    fontSize: 14,
    color: '#FF1493',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
  },
  voteButton: {
    alignItems: 'center',
  },
  nottieButton: {},
  hottieButton: {},
  buttonLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
