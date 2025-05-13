import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeView from './Screens/HomeScreen';
import PermissionsScreen from './Screens/PermissionsScreen';
import TestScreen from './Screens/TestScreen';
import ReaderSettingsScreen from './Screens/ReaderSettingsScreen';
import ReaderDetailsScreen from './Screens/ReaderDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="ReaderSettings" component={ReaderSettingsScreen} />
        <Stack.Screen name="ReaderDetails" component={ReaderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
