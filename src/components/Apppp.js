import {Text, View} from 'react-native';
import {useState, useEffect, useRef} from 'react';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';
let mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
};

const configuration = {
  iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
};

export default function Apppp() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const pConnection = useRef(null);

  useEffect(() => {
    StartCam();
    addCall()
  }, []);

  const createPeerConnection = () => {
    // Create and configure the peer connection
    const pc = new RTCPeerConnection(configuration);

    // Add event listeners
    // pc.onicecandidate = handleICECandidate;
    // pc.onconnectionstatechange = handleConnectionStateChange;
    // pc.oniceconnectionstatechange = handleICEConnectionStateChange;
    // pc.onicegatheringstatechange = handleICEGatheringStateChange;
    // pc.onsignalingstatechange = handleSignalingStateChange;
    // pc.ontrack = handleTrack;

    return pc;
  };

  async function StartCam() {
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
  }

  async function addCall() {
    try {
      const peerConnection = createPeerConnection();
      pConnection.current = peerConnection;

      const offer = await pConnection.createOffer();
      await pConnection.setLocalDescription(offer);
      await firestore().collection('callSignaling').doc('callSession').update({
        offer: offer
      })

    } catch (error) {
      console.log('Error while Creating call', error);
    }
  }

  // console.log(pConnection.current)
  function RenderLocalStream() {
    if (localStream) {
      return (
        // <View style={{ , overflow: 'hidden'}}>
        <RTCView
          streamURL={localStream.toURL()}
          style={{
            borderRadius: 50,
            elevation: 20,
            position: 'absolute',
            width: '32%',
            height: '25%',
            overflow: 'hidden',
            top: 20,
          }}
        />
        // </View>
      );
    }
    return <Text>hello</Text>;
  }
  function RenderRemoteStream() {
    if (localStream) {
      return (
        // <View style={{ , overflow: 'hidden'}}>
        <RTCView
          streamURL={localStream.toURL()}
          style={{
            borderRadius: 50,
            position: 'absolute',
            elevation: 20,
            width: '100%',
            height: '100%',
          }}
        />
        // </View>
      );
    }
    return <Text>hello</Text>;
  }

  return (
    <View style={{flex: 1}}>
      <RenderRemoteStream />
      <RenderLocalStream />
    </View>
  );
}
