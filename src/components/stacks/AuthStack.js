import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
// import {createStackNavigator} from '@react-navigation/native-stack'
import LoginScreen from '../../screens/LoginScreen';

Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <>
      <Stack.navigator>
        <Stack.screen name="Home" component={LoginScreen}/>
      </Stack.navigator>
    </>
  );
}

const styles = StyleSheet.create({});
