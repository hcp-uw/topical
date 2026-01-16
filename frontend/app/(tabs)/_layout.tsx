import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        headerStyle: { 
          backgroundColor: '#161f43',
        },
        headerShadowVisible: false,
        headerTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          height: 100,
          padding: 6,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Explore' ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search' ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search-sharp' : 'search-outline'} color={color} size={24} />
          ),
        }} 
      />
    </Tabs>
  );
}