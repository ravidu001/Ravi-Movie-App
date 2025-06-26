import "../globals.css"

import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

import { Link } from "expo-router";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);
  
  const { data:movies, loading:moviesLoading, error:moviesError } = useFetch(() => fetchMovies({
    query: ''
  }))
  // ADD THESE DEBUG LOGS
  // console.log('Movies data:', movies);
  // console.log('Movies loading:', moviesLoading);
  // console.log('Movies error:', moviesError);
  // console.log('Movies length:', movies?.length);
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}>
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        { moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"  
          />
        ) : (
          <View className="flex-1 mt-5">
          <SearchBar 
            onPress={()=> router.push("/search")}
            placeholder="Search for a movie"
          />

          {
            trendingMovies && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
              </View>
            )
          }
          <>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={()=> <View className="w-4"></View>}
              className="mb-4 mt-3"
              data={trendingMovies}
              renderItem={({item, index})=>(
                <TrendingCard movie={item} index={index}/>
              )}
            />
            
            <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>
            
            <FlatList 
              data={movies}
              renderItem={({ item }) => (
                <MovieCard 
                  {...item}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              columnWrapperStyle={{ 
                justifyContent: "flex-start",
                paddingRight: 5,
                gap: 20,
                marginBottom: 10
              }}
              className="mt-2 pb-32"
              scrollEnabled={false}
            />
          </>
        </View>
        )} 
      </ScrollView>
    </View>
  );
}
