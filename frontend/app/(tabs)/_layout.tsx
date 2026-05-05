import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { Image } from 'react-native';
import { useEffect } from 'react';
import { isAuthenticated } from '@/app/auth/auth';
import { authCurSession } from '@/database/auth';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    const loginRedirect = async () => {
      const u = await authCurSession();
      if (u == null) {
        const timeout = setTimeout(() => {
          router.replace('/auth/login');
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
     
    loginRedirect();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        headerStyle: {
          backgroundColor: '#00000000',
        },
        headerTitleStyle: {
          fontWeight: 900,
          fontSize: 25,
          paddingBottom: 10,
          // left: -110
        },
        headerShadowVisible: false,
        headerTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#171717fa',
          height: 80,
          paddingHorizontal: 6,
          borderTopWidth: 1,
          borderTopColor: '#252525CC',
        },
        tabBarItemStyle: {
          marginVertical: 10
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search-sharp' : 'search-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/images/profile.png')}
              style={{ width: 26, height: 26, borderRadius: 13, opacity: focused ? 1 : 0.5 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}