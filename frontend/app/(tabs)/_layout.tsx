import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
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