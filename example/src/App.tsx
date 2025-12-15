import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeView from './Screens/HomeScreen';
import PermissionsScreen from './Screens/PermissionsScreen';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomPrompt from './Screens/CustomPrompt';
import { PaymentProvider } from './providers/PaymentProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#fff" translucent={false} hidden={false} />
      <NavigationContainer>
        <PaymentProvider>
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
            <Stack.Screen
              name="CustomPrompt"
              component={CustomPrompt}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </PaymentProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
