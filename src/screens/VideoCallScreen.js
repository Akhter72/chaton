import React, {useEffect} from 'react';
import {AppRegistry, Platform, Text, View} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
      // Handle the change and navigate to the specific screen
      const changeData = remoteMessage.data;
      navigation.navigate(changeData.screenName);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Received initial notification:', remoteMessage);
          // Handle the change and navigate to the specific screen
          const changeData = remoteMessage.data;
          navigation.navigate(changeData.screenName);
        }
      });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Received background message:', remoteMessage);
      // Handle the change and navigate to the specific screen
      const changeData = remoteMessage.data;
      navigation.navigate(changeData.screenName);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View>
      <Text>Home Screen</Text>
      {/* Your Home screen UI components */}
    </View>
  );
};

const ScreenA = () => {
  return (
    <View>
      <Text>Screen A</Text>
      {/* Your Screen A UI components */}
    </View>
  );
};

const ScreenB = () => {
  return (
    <View>
      <Text>Screen B</Text>
      {/* Your Screen B UI components */}
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScreenA" component={ScreenA} />
        <Stack.Screen name="ScreenB" component={ScreenB} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

AppRegistry.registerComponent('MyApp', () => App);

// Background handling for Android
if (Platform.OS === 'android') {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', remoteMessage);
    // Handle the change and navigate to the specific screen
    const changeData = remoteMessage.data;
    navigation.navigate(changeData.screenName);
  });
}
