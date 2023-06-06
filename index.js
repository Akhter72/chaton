/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import LoginScreen from './src/screens/LoginScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import InCallScreen from './src/screens/InCallScreen';
import GettingCall from './src/components/GettingCall';
import Video from './src/components/Video';
import Appp from './src/components/Appp';
import Apppp from './src/components/Apppp';
import AgoraTest from './src/components/AgoraTest';

AppRegistry.registerComponent(appName, () => App);
