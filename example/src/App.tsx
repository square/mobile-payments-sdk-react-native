import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PermissionsScreen from './screens/PermissionScreen';
export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Permission"
          component={PermissionsScreen}
          options={{ headerTitleAlign: 'center', headerShadowVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
