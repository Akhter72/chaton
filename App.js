import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  AppState,
  Alert,
  ActivityIndicator,
} from 'react-native';
// import { store } from './src/redux/store';
import {Provider} from 'react-redux';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {Provider as ProviderContainer} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomePage from './src/screens/HomePage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatScreen from './src/screens/ChatScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AccountScreen from './src/screens/AccountScreen';
import AddFriendScreen from './src/screens/AddFriendScreen';
import Icon from 'react-native-vector-icons/Feather';
import FriendRequests from './src/screens/FriendRequests';
import NetInfo from '@react-native-community/netinfo';
import GettingCall from './src/components/GettingCall';
import AgoraTest from './src/components/AgoraTest';

import {DefaultTheme} from '@react-navigation/native';

//GyvoENgelVSKicdSEiJNZJQesai1_UAWkbl34OdNu4bYJvT1170uuILD3;

Stack = createStackNavigator();

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white', // Set the background color to white or any other light color
    text: 'black', // Set the text color to black or any other dark color
    // Add any other color overrides you want to customize
  },
};

function AppContainer() {
  // const theme = DefaultTheme;

  function AuthStack() {
    return (
      <>
        <Stack.Navigator>
          <Stack.Screen
            name="login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="register"
            component={RegisterScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </>
    );
  }

  function Navigation() {
    const [user, setUser] = useState('');
    // const status = AppState.currentState == "active" ? "online" : (new Date).toDateString()
    function AuthenticatedStack() {
      const navigation = useNavigation();
      return (
        <>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              options={{
                title: 'ChatOn',
                headerRight: () => (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon
                      name="bell"
                      size={30}
                      color="#3498db"
                      style={{marginRight: 20, marginTop: 5}}
                      onPress={() => navigation.navigate('AddFriend')}
                    />
                    <Icon
                      name="user-plus"
                      size={30}
                      color="#3498db"
                      style={{marginRight: 20}}
                      onPress={() => {
                        navigation.navigate('FriendRequests');
                      }}
                    />
                    <MaterialIcons
                      name="account-circle"
                      size={38}
                      color="#3498db"
                      style={{marginRight: 10}}
                      onPress={() => navigation.navigate('Account')}
                    />
                  </View>
                ),
              }}>
              {props => <HomePage {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="chat" options={{headerShown: false}}>
              {props => <ChatScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="GettingCall"
              component={GettingCall}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="InCall"
              component={AgoraTest}
              options={{headerShown: false}}
            />

            <Stack.Screen name="Account" options={{title: 'Profile'}}>
              {props => <AccountScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="AddFriend" options={{title: 'Add Friend'}}>
              {props => <AddFriendScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="FriendRequests" options={{title: 'Requests'}}>
              {props => <FriendRequests {...props} user={user} />}
            </Stack.Screen>
          </Stack.Navigator>
        </>
      );
    }

    useEffect(() => {
      const unregister = auth().onAuthStateChanged(async userExist => {
        if (userExist) {
          setUser(userExist);
        } else setUser('');
      });
      return () => {
        unregister();
      };
    }, []);

    useEffect(() => {
      if (user) {
        const userRef = firestore().collection('users').doc(user.uid);
        const handleAppStateChange = nextAppState => {
          if (nextAppState == 'active') {
            userRef.update({
              status: 'Online',
            });
          } else {
            userRef.update({
              status: firestore.FieldValue.serverTimestamp(),
            });
          }
        };
        const appStateSubscription = AppState.addEventListener(
          'change',
          nextAppState => {
            handleAppStateChange(nextAppState);
          },
        );

        return () => {
          appStateSubscription.remove();
        };
      }
    }, [user]);

    return <>{user ? <AuthenticatedStack /> : <AuthStack />}</>;
  }
  return (
    <>
      <StatusBar backgroundColor="#3498db" />
      <ProviderContainer>
        <NavigationContainer theme={MyLightTheme}>
          <Navigation />
        </NavigationContainer>
      </ProviderContainer>
    </>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe(); // Cleanup the event listener when the component is unmounted
    };
  }, []);

  if (!isConnected) return <ActivityIndicator size="large" />;
  else return <AppContainer />;
}
