import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  SavedMovie,
  clearAllSavedMovies,
  getSavedMovies,
} from '@/services/userSettings';

import MovieCard from '@/components/MovieCard';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useFocusEffect } from 'expo-router';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';

const SavedMovies = () => {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use global context for count and updates
  const { savedCount, refreshSavedMovies } = useSavedMovies();

  // Load saved movies when component mounts
  useEffect(() => {
    loadSavedMovies();
  }, []);

  // Reload when screen comes into focus (after saving/unsaving movies)
  useFocusEffect(
    React.useCallback(() => {
      loadSavedMovies();
      refreshSavedMovies(); // Also refresh the global context
    }, [])
  );

  const loadSavedMovies = async () => {
    try {
      setLoading(true);
      
      // Load saved movies
      const movies = await getSavedMovies();
      setSavedMovies(movies);
      
      console.log('✅ Loaded saved movies:', movies.length);
    } catch (error) {
      console.error('❌ Error loading saved movies:', error);
      Alert.alert('Error', 'Failed to load saved movies');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedMovies();
    await refreshSavedMovies();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (savedMovies.length === 0) {
      Alert.alert('Info', 'No saved movies to clear');
      return;
    }

    Alert.alert(
      'Clear All Saved Movies',
      `Are you sure you want to remove all ${savedMovies.length} saved movies? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: performClearAll
        }
      ]
    );
  };

  const performClearAll = async () => {
    try {
      setLoading(true);
      const result = await clearAllSavedMovies();
      
      if (result.success) {
        setSavedMovies([]);
        await refreshSavedMovies(); // Update global context
        Alert.alert('Success', 'All saved movies have been removed');
      } else {
        Alert.alert('Error', result.error || 'Failed to clear saved movies');
      }
    } catch (error) {
      console.error('❌ Error clearing saved movies:', error);
      Alert.alert('Error', 'Failed to clear saved movies');
    } finally {
      setLoading(false);
    }
  };

  // Convert SavedMovie to Movie format for MovieCard
  const convertToMovieFormat = (savedMovie: SavedMovie) => ({
    id: savedMovie.movie_id,
    title: savedMovie.title,
    poster_path: savedMovie.poster_path || '',
    release_date: savedMovie.release_date || '',
    vote_average: (savedMovie.vote_average || 0) / 10, // Convert back to decimal (75 -> 7.5)
    overview: savedMovie.overview || '',
    // Add other required Movie fields with defaults
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    original_language: 'en',
    original_title: savedMovie.title,
    popularity: 0,
    video: false,
    vote_count: 0
  });

  // Handle real-time save state changes from MovieCard
  const handleSaveStateChange = (movieId: number, isSaved: boolean) => {
    if (!isSaved) {
      // Movie was unsaved, remove it from the list immediately
      setSavedMovies(prev => prev.filter(movie => movie.movie_id !== movieId));
      console.log('🗑️ Removed movie from saved list:', movieId);
    }
    // The global context is already updated by the MovieCard
  };

  // Render movie with proper layout
  const renderMovie = ({ item }: { item: SavedMovie }) => (
    <View style={{ flex: 1/3, paddingHorizontal: 8, marginBottom: 16 }}>
      <MovieCard 
        {...convertToMovieFormat(item)} 
        width="full"
        onSaveStateChange={handleSaveStateChange}
      />
      {/* Show saved date */}
      <Text className="text-gray-400 text-xs text-center mt-1">
        Saved {new Date(item.saved_at || '').toLocaleDateString()}
      </Text>
    </View>
  );

  // Create padded data for FlatList to ensure proper layout
  const createPaddedData = (data: SavedMovie[]) => {
    const paddedData = [...data];
    const remainder = data.length % 3;
    if (remainder !== 0) {
      // Add empty items to complete the last row
      for (let i = 0; i < 3 - remainder; i++) {
        paddedData.push({ movie_id: -i - 1 } as SavedMovie); // Negative IDs for empty items
      }
    }
    return paddedData;
  };

  const renderMovieWithPadding = ({ item }: { item: SavedMovie }) => {
    // Render empty space for padding items
    if (item.movie_id < 0) {
      return <View style={{ flex: 1/3, paddingHorizontal: 8 }} />;
    }
    
    return renderMovie({ item });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-primary">
        <Image 
          source={images.bg} 
          className="absolute w-full h-full z-0" 
          resizeMode="cover" 
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-white mt-4 text-center">Loading saved movies...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />

      <FlatList
        data={createPaddedData(savedMovies)}
        renderItem={renderMovieWithPadding}
        keyExtractor={(item, index) => item.$id || `${item.movie_id}-${index}`}
        numColumns={3}
        className="px-3"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="w-full flex-row justify-center items-center mt-20 mb-6">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            {/* Title and Count */}
            <View className="flex-row items-center justify-between mb-4 px-2">
              <View>
                <Text className="text-white text-xl font-bold">Saved Movies</Text>
                <Text className="text-gray-400 text-sm">
                  {savedCount} movie{savedCount !== 1 ? 's' : ''} saved
                </Text>
              </View>
              
              {/* Clear All Button */}
              {savedMovies.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearAll}
                  className="bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-red-400 text-sm font-medium">Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats */}
            {savedMovies.length > 0 && (
              <View className="bg-gray-800/50 rounded-lg p-4 mx-2 mb-6 border border-gray-700">
                <Text className="text-white text-sm font-medium mb-2">Your Collection</Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-blue-400 text-lg font-bold">{savedCount}</Text>
                    <Text className="text-gray-400 text-xs">Movies</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-green-400 text-lg font-bold">
                      {savedMovies.length > 0 
                        ? (savedMovies.reduce((sum, movie) => sum + ((movie.vote_average || 0) / 10), 0) / savedMovies.length).toFixed(1)
                        : '0'
                      }
                    </Text>
                    <Text className="text-gray-400 text-xs">Avg Rating</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-purple-400 text-lg font-bold">
                      {new Set(savedMovies.map(m => m.release_date?.split('-')[0]).filter(Boolean)).size}
                    </Text>
                    <Text className="text-gray-400 text-xs">Years</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="mt-20 px-5 items-center">
              <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-4">
                <Image source={icons.save} className="w-8 h-8" tintColor="#9CA3AF" />
              </View>
              <Text className="text-gray-400 text-lg font-medium mb-2 text-center">
                No Saved Movies Yet
              </Text>
              <Text className="text-gray-500 text-sm text-center leading-6">
                Start building your movie collection by saving movies you want to watch later. 
                Tap the bookmark icon on any movie to save it here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default SavedMovies;