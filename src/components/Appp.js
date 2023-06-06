import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';

const Appp = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [pc, setPC] = useState(null);

  useEffect(() => {
    requestCameraAndAudioPermissions();
  }, []);

  const requestCameraAndAudioPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Camera and audio permissions granted');
          startLocalStream();
        } else {
          console.log('Camera and audio permissions denied');
        }
      } catch (err) {
        console.error('Failed to request permissions:', err);
      }
    } else {
      startLocalStream();
    }
  };

  const startLocalStream = () => {
    mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(stream => {
        setLocalStream(stream);
      })
      .catch(error => {
        console.error('Failed to access local media:', error);
      });
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
    };
    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to the connection
    localStream
      .getTracks()
      .forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = handleICECandidate;
    // peerConnection.ontrack = handleTrack;
    peerConnection.ontrack = event => {
      if (event.streams && event.streams.length > 0) {
        setRemoteStream(event.streams[0]);
      }
    };

    peerConnection.oniceconnectionstatechange = handleICEConnectionStateChange;
    return peerConnection;
  };

  const handleICECandidate = event => {
    if (event.candidate) {
      // Send the ICE candidate to the remote peer via Firestore
      firestore().collection('callSignaling').doc('callSession').update({
        candidate: event.candidate.toJSON(),
      });
    }
  };

  const handleTrack = event => {
    const remoteStream = event.streams[0];
    setRemoteStream(remoteStream);

    // Add the remote stream's track to the remoteStream state
    remoteStream.onaddtrack = () => {
      setRemoteStream(remoteStream);
    };

    // Add the remote stream's track to the peer connection's remote stream
    if (pc) {
      event.track.onunmute = () => {
        if (!pc.remoteStream) {
          pc.remoteStream = new MediaStream();
          setRemoteStream(pc.remoteStream);
        }
        pc.remoteStream.addTrack(event.track);
      };
    }
  };

  const handleICEConnectionStateChange = event => {
    console.log('ICE connection state:', event.target.iceConnectionState);
  };

  const startCall = async () => {
    setIsCalling(true);

    try {
      const peerConnection = createPeerConnection();
      setPC(peerConnection);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const offerObj = JSON.stringify(offer);
      //Save the offer in Firestore
      await firestore()
        .collection('callSignaling')
        .doc('callSession')
        .update({
          offer: offer,
        })
        .then(() => console.log('added'))
        .catch(error => console.log(error));

      // // Listen for changes in Firestore document
      firestore()
        .collection('callSignaling')
        .doc('callSession')
        .onSnapshot(snapshot => {
          const data = snapshot.data();
          if (data && data.answer) {
            handleAnswer(data.answer);
          }
        });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };
  const handleAnswer = async answer => {
    if (pc) {
      try {
        const sessionDescription = new RTCSessionDescription(answer);
        await pc.setRemoteDescription(sessionDescription);

        // Listen for ICE candidates from Firestore
        firestore()
          .collection('callSignaling')
          .doc('callSession')
          .onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data && data.candidate) {
              handleRemoteICECandidate(data.candidate);
            }
          });
      } catch (error) {
        console.error('Failed to set remote description:', error);
      }
    }
  };

  // console.log(remoteStream);
  const handleRemoteICECandidate = async candidate => {
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    }
  };

  const answerCall = async () => {
    setIsCalling(true);
// setRemoteStream(localStream);

    try {
      const peerConnection = createPeerConnection();
      // output
      setPC(peerConnection);

      firestore()
        .collection('callSignaling')
        .doc('callSession')
        .onSnapshot(snapshot => {
          const data = snapshot.data();
          if (data && data.offer) {
            handleOffer(data.offer);
          }
        });
    } catch (error) {
      console.error('Failed to create peer connection:', error);
    }
  };

  // var p = pc;
  console.log('Global Pc', pc);

  const handleOffer = async offer => {
    // const peerConnection = createPeerConnection();

    // console.log('Local Pc', pc);
    // console.log(p);
    if (pc) {
      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        const answer = await pc.createAnswer();
        await peerConnection.setLocalDescription(answer);
        // await handleAnswer(answer);
        // Save the answer in Firestore
        firestore().collection('callSignaling').doc('callSession').update({
          answer: answer,
        });

        // Listen for ICE candidates from Firestore
        firestore()
          .collection('callSignaling')
          .doc('callSession')
          .onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data && data.candidate) {
              handleRemoteICECandidate(data.candidate);
            }
          });
        

        // setPC(peerConnection);
        // peerConnection.ontrack = event => {
        //   console.log(event.streams && event.streams.length)
        //   if (event.streams && event.streams.length > 0) {
            
        //   }
        // };
      } catch (error) {
        console.error('Failed to create answer:', error);
      }
    } else {
      console.log('kkk');
    }
  };

  const renderLocalStream = () => {
    if (localStream) {
      return (
        <RTCView streamURL={localStream.toURL()} style={styles.localStream} />
      );
    }
    return null;
  };

  const renderRemoteStream = () => {
    if (remoteStream) {
      return (
        <RTCView streamURL={remoteStream.toURL()} style={styles.remoteStream} />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderRemoteStream()}
      {renderLocalStream()}
      <View style={styles.buttonContainer}>
        <Button
          title={isCalling ? 'Calling...' : 'Call'}
          onPress={startCall}
          disabled={isCalling}
        />
        <Button title="Answer" onPress={answerCall} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  localStream: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 150,
    height: 200,
    borderRadius: 5,
  },
  remoteStream: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Appp;
