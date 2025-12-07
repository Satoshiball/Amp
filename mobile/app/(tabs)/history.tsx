import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';

export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-history'],
    queryFn: () => api.getUserHistory(),
  });

  const entries = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My History</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FF1493" />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.entryCard}>
              <Image
                source={{ uri: item.photoUrl }}
                style={styles.thumbnail}
              />

              <View style={styles.entryInfo}>
                <Text style={styles.weekLabel}>
                  Week {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.location}>
                  {item.citySnapshot}, {item.stateSnapshot}
                </Text>
                <Text style={styles.score}>
                  Final Score: {item.finalScore}
                </Text>
                <Text style={styles.stats}>
                  🔥 {item.hottieVotes} | ❄️ {item.nottieVotes} | ⚡ {item.boostCount}
                </Text>
              </View>

              {item.finalScore > 50 && (
                <View style={styles.badge}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={80} color="#666" />
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptyText}>
                Enter a competition to start building your history!
              </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
  },
  listContent: {
    padding: 20,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  entryInfo: {
    flex: 1,
  },
  weekLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  location: {
    color: '#999',
    fontSize: 12,
    marginTop: 3,
  },
  score: {
    color: '#FF1493',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  stats: {
    color: '#666',
    fontSize: 12,
    marginTop: 3,
  },
  badge: {
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
