import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {MediaStream, RTCView} from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/FontAwesome5';

function ButtonContainer({hangup}) {
  return (
    <View style={styles.ButtonContainer}>
      <Icon
        name="phone"
        color="white"
        size={40}
        onPress={hangup}
        style={{backgroundColor: 'red', padding: 15, borderRadius: 40}}
      />
    </View>
  );
}


export default function Video({hangup}) {
  const localStream = MediaStream | null;
  const remoteStream = MediaStream | null;
  if(localStream && !remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView 
          streamURL={localStream.toUrl()}
          objectFit='cover'
          style={styles.video}
        />
        <RTCView 
          streamURL={remoteStream.toUrl()}
          objectFit='cover'
          style={styles.videoLocal}
        />
        <ButtonContainer hangup={hangup}/>
      </View>
    )
  }
  return (
    <ButtonContainer hangup={hangup}/>
  );
}

const styles = StyleSheet.create({
  ButtonContainer: {
    flexDirection: 'row',
    bottom: 30,
  },
  container: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoLocal: {
    position: 'absolute',
    width: 100,
    height: 130,
    top: 0,
    Left: 20,
    elevation: 20,
  }
});
