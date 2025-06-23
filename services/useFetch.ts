// fetchMovies
//fetchMovieDetails

import { useEffect, useState } from "react";

//useFetch(fetchMovies)

const useFetch = (fetchFunction: ()=> Promise<T>, autoFetch = true) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await fetchFunction();

            setData(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
            
        } finally {
            setLoading(false);
        }
    }

    const reset = () => {
        setData(null);
        setLoading(false);
        setError(null);
    }

    useEffect(()=> {
        if (autoFetch) {
            fetchData();
        }
    },[]);

    return { data,loading, error, fetchData, reset  };
}

export default useFetch;