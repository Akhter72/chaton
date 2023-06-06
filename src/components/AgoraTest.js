import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AgoraUIKit from 'agora-rn-uikit';
import {agoraConstants} from '../constants/VariableConstants';
import firestore from '@react-native-firebase/firestore';
import { removeCall } from '../utils/utilFunctions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

const AgoraTest = ({route}) => {
  const [videoCall, setVideoCall] = useState(true);
  const channel = route.params.channel;
  const callId = route.params.callId;
  


  
  const connectionData = {
    appId: agoraConstants.appid,
    channel: channel,
  };

  const rtcCallbacks = {
    EndCall: () => setTimeout(() => {
      setVideoCall(false)
      removeCall(callId)
    }, 0),
  };

  if (videoCall) {
    return (
      <AgoraUIKit connectionData={connectionData} rtcCallbacks={rtcCallbacks} />
    );
  }
};

export default AgoraTest;
