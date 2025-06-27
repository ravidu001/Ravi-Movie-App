import { FlatList, Image, Text, View } from 'react-native'

import MovieCard from '@/components/MovieCard'
import React from 'react'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'

const saved = () => {
  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode="cover" />

      {/* <FlatList
        data={[]}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        className='px-5'
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center mt-20 items-center'>
              <Image source={icons.logo} className='w-12 h-10' />
            </View>
          </>
        }

        ListEmptyComponent={
          
            <View className='mt-10 px-5'>
                <Text className='text-center text-gray-500'>
                  No saved movies found. Start adding some!
                </Text>
            </View>
        }
      /> */}
    </View>
  )
}

export default saved