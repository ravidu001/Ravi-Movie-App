import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { getSavedMoviesCount, isMovieSaved } from '@/services/userSettings';

interface SavedMoviesContextType {
  savedMovieIds: Set<number>;
  savedCount: number;
  updateSavedMovie: (movieId: number, isSaved: boolean) => void;
  refreshSavedMovies: () => Promise<void>;
  isMovieCurrentlySaved: (movieId: number) => boolean;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

interface SavedMoviesProviderProps {
  children: ReactNode;
}

export const SavedMoviesProvider: React.FC<SavedMoviesProviderProps> = ({ children }) => {
  const [savedMovieIds, setSavedMovieIds] = useState<Set<number>>(new Set());
  const [savedCount, setSavedCount] = useState(0);

  // Initialize saved movies when provider mounts
  useEffect(() => {
    initializeSavedMovies();
  }, []);

  const initializeSavedMovies = async () => {
    try {
      // Get saved movies count
      const count = await getSavedMoviesCount();
      setSavedCount(count);

      // You could also load all saved movie IDs here if needed
      // For now, we'll load them on-demand
      console.log('✅ SavedMoviesContext initialized with count:', count);
    } catch (error) {
      console.error('❌ Error initializing saved movies context:', error);
    }
  };

  const updateSavedMovie = (movieId: number, isSaved: boolean) => {
    setSavedMovieIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(movieId);
        setSavedCount(prevCount => prevCount + 1);
      } else {
        newSet.delete(movieId);
        setSavedCount(prevCount => Math.max(0, prevCount - 1));
      }
      console.log(`🔄 Updated saved movie ${movieId}: ${isSaved ? 'saved' : 'unsaved'}`);
      return newSet;
    });
  };

  const refreshSavedMovies = async () => {
    try {
      const count = await getSavedMoviesCount();
      setSavedCount(count);
      
      // Clear the cache and let components re-check individual movies
      setSavedMovieIds(new Set());
      
      console.log('🔄 Refreshed saved movies context');
    } catch (error) {
      console.error('❌ Error refreshing saved movies:', error);
    }
  };

  const isMovieCurrentlySaved = (movieId: number): boolean => {
    return savedMovieIds.has(movieId);
  };

  const contextValue: SavedMoviesContextType = {
    savedMovieIds,
    savedCount,
    updateSavedMovie,
    refreshSavedMovies,
    isMovieCurrentlySaved,
  };

  return (
    <SavedMoviesContext.Provider value={contextValue}>
      {children}
    </SavedMoviesContext.Provider>
  );
};

export const useSavedMovies = (): SavedMoviesContextType => {
  const context = useContext(SavedMoviesContext);
  if (!context) {
    throw new Error('useSavedMovies must be used within a SavedMoviesProvider');
  }
  return context;
};