import { Image, ImageBackground, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Tabs, useFocusEffect } from 'expo-router'

import { getCurrentUser } from '@/services/auth'
import { getProfilePictureUrl } from '@/services/userSettings'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'

const TabIcon = ({ focused, icon, title, isProfile = false, profilePictureUrl, userInitial }: {
  focused: boolean, 
  icon: any, 
  title: string,
  isProfile?: boolean,
  profilePictureUrl?: string | null,
  userInitial?: string
}) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'
      >
        {isProfile ? (
          <View className="flex-row items-center">
            {profilePictureUrl ? (
              <Image 
                source={{ uri: profilePictureUrl }}
                className="w-5 h-5 rounded-full mr-2"
                style={{ backgroundColor: '#151312' }}
              />
            ) : (
              <View className="w-5 h-5 bg-secondary rounded-full items-center justify-center mr-2">
                <Text className="text-light-100 text-xs font-bold">
                  {userInitial || 'U'}
                </Text>
              </View>
            )}
            <Text className='text-secondary text-base font-semibold'>{title}</Text>
          </View>
        ) : (
          <>
            <Image source={icons.person} tintColor="#151312" className="size-5" />
            <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
          </>
        )}
      </ImageBackground>
    )
  } else {
    return (
      <View className='size-full justify-center items-center mt-4 rounded-full'>
        {isProfile ? (
          profilePictureUrl ? (
            <Image 
              source={{ uri: profilePictureUrl }}
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: '#A8B5DB' }}
            />
          ) : (
            <View className="w-8 h-8 bg-gray-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {userInitial || 'U'}
              </Text>
            </View>
          )
        ) : (
          <Image source={icon} tintColor="#A8B5DB" className='size-5' />
        )}
      </View>
    )
  }
}

const _layout = () => {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    try {
      // Get user initial
      const user = await getCurrentUser();
      if (user) {
        setUserInitial(user.fullName.charAt(0).toUpperCase());
      }

      // Get profile picture
      const pictureUrl = await getProfilePictureUrl();
      setProfilePictureUrl(pictureUrl);
    } catch (error) {
      console.error('Error loading profile data for tabs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profile data when component mounts
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Reload profile data when tab screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        },
        tabBarStyle: {
          backgroundColor: '#0f0D23',
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#0f0D23' 
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Home", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              icon={icons.home}
              title="Home"
            />
          )
        }} 
      />
      
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: "Search", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              icon={icons.search}
              title="Search"
            />
          ) 
        }} 
      />
          
      <Tabs.Screen 
        name="saved" 
        options={{ 
          title: "Saved", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              icon={icons.save}
              title="Saved"
            />
          ) 
        }} 
      /> 
           
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profile", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              icon={icons.person}
              title="Profile"
              isProfile={true}
              profilePictureUrl={profilePictureUrl}
              userInitial={userInitial}
            />
          ) 
        }} 
      />
    </Tabs>
  )
}

export default _layout