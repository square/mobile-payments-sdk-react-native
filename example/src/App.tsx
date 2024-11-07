import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PermissionsScreen from './screens/PermissionScreen';
import CustomBackButton from './components/CustomBackButton';
import SplashScreen from './Screens/SplashScreen';

                                  
  const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={{
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerLeft: () => <CustomBackButton />,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
