import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeView from './Screens/HomeScreen';
import PermissionsScreen from './Screens/PermissionsScreen';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar backgroundColor="#fff" translucent={false} hidden={false} />
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
     
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
