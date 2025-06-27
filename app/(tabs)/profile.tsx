import { Image, Text, View } from 'react-native'

import React from 'react'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'

const profile = () => {
  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode="cover" />

      <>
        <View className='w-full flex-row justify-center mt-20 items-center'>
          <Image source={icons.logo} className='w-12 h-10' />
        </View>
      </>
    </View>
    
  )
}

export default profile