import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';

export default function Leaderboard() {
  const [filter, setFilter] = useState<'all' | 'male' | 'female'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => api.getCurrentLeaderboard({ gender: filter }),
  });

  const entries = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'male' && styles.filterButtonActive]}
            onPress={() => setFilter('male')}
          >
            <Text style={[styles.filterText, filter === 'male' && styles.filterTextActive]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'female' && styles.filterButtonActive]}
            onPress={() => setFilter('female')}
          >
            <Text style={[styles.filterText, filter === 'female' && styles.filterTextActive]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF1493" />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={styles.entryCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>

              <Image
                source={{ uri: item.photoUrl }}
                style={styles.thumbnail}
              />

              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>
                  {item.user.firstName}, {item.ageAtEntry}
                </Text>
                <Text style={styles.entryLocation}>
                  {item.citySnapshot}, {item.stateSnapshot}
                </Text>
                <Text style={styles.entryScore}>
                  Score: {item.finalScore}
                </Text>
                <Text style={styles.entryStats}>
                  🔥 {item.hottieVotes} | ❄️ {item.nottieVotes} | ⚡ {item.boostCount}
                </Text>
              </View>

              <TouchableOpacity style={styles.boostButton}>
                <Ionicons name="flash" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No entries yet</Text>
            </View>
          }
        />
      )}
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF1493',
    borderColor: '#FF1493',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryLocation: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  entryScore: {
    color: '#FF1493',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  entryStats: {
    color: '#666',
    fontSize: 12,
    marginTop: 3,
  },
  boostButton: {
    padding: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
