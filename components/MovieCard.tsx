import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { isMovieSaved, toggleSaveMovie } from '@/services/userSettings';

import { Link } from 'expo-router';
import { icons } from '@/constants/icons';

interface MovieCardProps extends Movie {
  onSaveStateChange?: (movieId: number, isSaved: boolean) => void;
  width?: 'grid' | 'full' | 'auto'; // New prop for width control
  containerStyle?: any; // Optional custom container style
}

const MovieCard = ({ 
  id, 
  poster_path, 
  title, 
  vote_average, 
  release_date, 
  overview,
  onSaveStateChange,
  width = 'grid', // Default to grid layout (30% width)
  containerStyle
}: MovieCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Check if movie is saved when component mounts
  useEffect(() => {
    checkSaveStatus();
  }, [id]);

  const checkSaveStatus = async () => {
    try {
      const saved = await isMovieSaved(id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const handleToggleSave = async (e: any) => {
    // Prevent navigation when tapping save button
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return; // Prevent double-tap

    setIsToggling(true);
    try {
      // Ensure all data is properly formatted
      const movieData = {
        id: Number(id),
        title: title || 'Unknown Title',
        poster_path: poster_path || '',
        release_date: release_date || '',
        vote_average: Number(vote_average) || 0,
        overview: overview || ''
      };

      console.log('🎬 Toggling save for movie:', movieData.title);

      const result = await toggleSaveMovie(movieData);
      
      if (result.success) {
        setIsSaved(result.saved);
        
        // Notify parent component about the state change
        if (onSaveStateChange) {
          onSaveStateChange(id, result.saved);
        }
        
        console.log(`✅ ${result.saved ? 'Saved' : 'Removed'}: ${title}`);
      } else {
        console.error('Toggle save failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to update saved status');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update saved status');
    } finally {
      setIsToggling(false);
    }
  };

  // Determine width class based on width prop
  const getWidthClass = () => {
    switch (width) {
      case 'full':
        return 'w-full';
      case 'grid':
        return 'w-[30%]';
      case 'auto':
        return 'w-auto';
      default:
        return 'w-[30%]';
    }
  };

  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity 
        className={`${getWidthClass()} relative`}
        style={containerStyle}
      >
        <Image 
          source={{
            uri: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : 'https://placehold.co/600x400/1a1a1a/ffffff.png'
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleToggleSave}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center ${
            isSaved ? 'bg-blue-600' : 'bg-black/50'
          } ${isToggling ? 'opacity-50' : ''}`}
          disabled={isToggling}
        >
          <Image 
            source={icons.save} 
            className="w-4 h-4" 
            tintColor={isSaved ? '#FFFFFF' : '#9CA3AF'} 
          />
        </TouchableOpacity>

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>
        
        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs font-bold uppercase text-white">
            {Math.round((vote_average || 0) / 2)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {release_date?.split('-')[0] || 'N/A'}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Movie
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;