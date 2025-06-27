export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}` // Fixed: Added backticks
    }
}

// export const fetchUserSavedMovies = async () => {
//   const token = await getToken();
//   if (!token) throw new Error('No authentication token available');

//   const response = await fetch(`${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_METRICS_COLLECTION_ID}/documents`, {
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) throw new Error('Failed to fetch saved movies');

//   return response.json();
// };

export const fetchMovies = async ({ query }: { query: string }) => {
    const endpoint = query
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}` // Fixed: Added backticks
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`; // Fixed: Added backticks

    // console.log('API Endpoint:', endpoint); // Debug log
    // console.log('API Headers:', TMDB_CONFIG.headers); // Debug log

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
        console.error('API Error:', response.status, response.statusText); // Better error logging
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('API Response:', data); // Debug log
    return data.results;
};

export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        })
        
        if (!response.ok) throw new Error('Failed to fetch movie details');

        const data = await response.json();

        return data;
        
    } catch (error) {
        console.log(error)
        throw error;
    }
}
