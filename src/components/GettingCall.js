import React, {useState, useEffect, useRef} from 'react';
import {Text, StyleSheet, View, Image} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import {removeCall} from '../utils/utilFunctions';
import Sound from 'react-native-sound';

export default function GettingCall({route}) {
  const callId = route.params.callId;
  const channel = route.params.channel;
  const [caller, setCaller] = useState(null);
  const sound = useRef(null);

  useEffect(() => {
    const playSound = () => {
      sound.current = new Sound(require('../../android/app/src/main/res/raw/ringtone.mp3'), error => {
        if (error) {
          console.log('Error loading sound: ', error);
        } else {
          sound.current.setVolume(1); // Set the volume (0.0 - 1.0)
          sound.current.setNumberOfLoops(-1); // Play the sound repeatedly (-1 for infinite loop)
          sound.current.play(success => {
            if (success) {
              console.log('Sound played successfully');
            } else {
              console.log('Sound playback failed');
            }
          });
        }
      });
    };

    playSound();
  }, []);



  const stopSound = () => {
    if (sound.current) {
      sound.current.stop();
      sound.current.release();
    }
  };

  useEffect(() => {
    async function loadData() {
      const callerId = channel.split('_')[0];
      const user = await firestore().collection('users').doc(callerId).get();
      setCaller(user.data());
    }
    loadData();
  }, [caller]);
  function rejectCallHandler() {
    stopSound();
    removeCall(callId);
  }
  function acceptCallHandler() {
    stopSound();
    console.log('accepting');
    const callRef = firestore().collection('calls').doc(callId);
    callRef.update({
      status: 'Recieved',
    });
  }
  return (
    <View style={styles.container}>
      {caller ? (
        <>
          <Image style={styles.image} source={{uri: caller.pic}} />
          <Text style={styles.name}>{caller.name}</Text>
        </>
      ) : (
        <Image style={styles.image} source={require('../assets/calling.jpg')} />
      )}

      <View style={styles.bContainer}>
        <FontAwesome5
          name="phone"
          color="white"
          size={40}
          style={{backgroundColor: 'green', padding: 15, borderRadius: 40}}
          onPress={acceptCallHandler}
        />
        <FontAwesome5
          name="phone"
          color="white"
          size={40}
          style={{backgroundColor: 'red', padding: 15, borderRadius: 40}}
          onPress={rejectCallHandler}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    width: undefined,
    height: '100%',
    aspectRatio: 1,
  },
  bContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    bottom: '10%',
  },
  name: {
    fontSize: 28,
    marginTop: 20,
    fontWeight: 'bold',
    color: 'grey',
  },
});
