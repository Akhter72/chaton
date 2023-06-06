// import { configure } from '@react-native-community/netinfo';
import {mediaDevices} from 'react-native-webrtc';
import firestore from '@react-native-firebase/firestore';

export const differenceInDays = (previousDate, curDate) => {
  const diffInMills = Math.abs(curDate - previousDate);
  const days = Math.floor(diffInMills / (1000 * 60 * 60 * 24));
  return days;
};

export class Utils {
  static async getStream() {
    //   "}]}
    let isFront = true;
    const sourceInfos = mediaDevices.enumerateDevices();
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'front' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 640,
        height: 480,
        frameRate: 30,
        facing: isFront ? 'front' : 'environment',
        deviceId: videoSourceId,
      },
    });
    if (typeof stream != 'boolean') return stream;
    return null;
  }
}

export function removeCall(callId) {
  const callRef = firestore().collection('calls').doc(callId);
  callRef.delete().then(() => console.log('call deleted'));
}


export function deleteUnRespondedCalls() {
  const callRef = firestore().collection('calls');
  const timer = setTimeout(() => {
    callRef
      .where('status', '==', 'initiated')
      .get()
      .then((querySnapshot) => {
        console.log(querySnapshot)
        querySnapshot.forEach((docSnapshot) => {
          // const { timestamp } = docSnapshot.data();
          console.log(querySnapshot.data())
          // console.log(timestamp)
          // const callTime = timestamp.toDate()
          // const currentTime = new Date();
          // const timeDiff = currentTime - callTime;

          // if (timeDiff > 60000) {
          //   docSnapshot.ref.delete().catch((error) => {
          //     console.log('Error deleting call:', error);
          //   });
          // }
        });
      })
      .catch((error) => {
        console.log('Error querying calls:', error);
      });
  }, 60000);

  return () => clearTimeout(timer);
}