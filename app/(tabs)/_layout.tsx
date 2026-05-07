import { Tabs } from 'expo-router';
import { FileText, Home, Menu, Users, Vote } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#b5b5b5',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5E5',
          height: Platform.OS === 'ios' ? 92 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: '의원',
          tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: '법안',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="votes"
        options={{
          title: '표결',
          tabBarIcon: ({ color }) => <Vote size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '더보기',
          tabBarIcon: ({ color }) => <Menu size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
