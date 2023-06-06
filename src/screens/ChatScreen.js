import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import {differenceInDays} from '../utils/utilFunctions';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserOptions from '../components/UI/UserOptions';
import {updateFriendRequestStatus} from '../services/userServices';
import {FriendRequestStatus} from '../constants/VariableConstants';
import NetInfo from '@react-native-community/netinfo';
// import AgoraUIKit from 'agora-rn-uikit';
import InCallScreen from './InCallScreen';

export default function ChatScreen({user, route, navigation}) {
  const [messages, setMessages] = useState([]);
  const {uid} = route.params;
  const docId = uid > user.uid ? user.uid + '_' + uid : uid + '_' + user.uid;
  const [status, setStatus] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isModalVisible, setIsModelVisible] = useState(false);
  const [disableInputState, setDisableInputState] = useState(false);
  const [accountState, setAccountState] = useState(route.params.accountState);
  const [videoCall, setVideoCall] = useState(false);
  const [activeCallers, setActiveCallers] = useState([]);

  useEffect(() => {
    var dummyFriendList = [];
    const callsRef = firestore().collection('calls');
    const unsubscribe = callsRef.onSnapshot(qSnap => {
      qSnap.forEach(dSnap => {
        const data = dSnap.data();
        dummyFriendList.push(data.callae);
        dummyFriendList.push(data.caller);
      });
    });
    setActiveCallers(dummyFriendList);
  }, []);

  console.log(activeCallers);

  useEffect(() => {
    const messageRef = firestore().collection('chats');
    //     // .doc(docId)
    //     // .collection('messages')
    //     // .orderBy('createdAt', 'desc');
    // console.log(messageRef);
    //     messageRef.onSnapshot(snap => {
    //       console.log(snap)
    //       snap.forEach(change => {
    //         console.log(change.data())
    // //         if(change.type === 'added') {
    // //           // const unsubscribe = NetInfo.addEventListener(state => {
    // //           console.log('change happened');
    // //         }
    //       });
    //     })
  }, []);

  useEffect(() => {
    if (route.params.accountState === FriendRequestStatus.BLOCK) {
      setDisableInputState(true);
    }
    const messageRef = firestore()
      .collection('chatrooms')
      .doc(docId)
      .collection('messages')
      .orderBy('createdAt', 'desc');
    const otherMessengerRef = () => {
      firestore()
        .collection('users')
        .doc(uid)
        .onSnapshot(snap => {
          const data = snap.data().status;
          setOtherUser(snap.data());
          if (typeof data == 'string') {
            setStatus(data);
          } else {
            const lastSeen = data.toDate();
            const days = differenceInDays(lastSeen, new Date());
            const dayName = days === 0 ? 'Today' : 'Yesterday';
            if (days > 1) {
              const date = data.toDate().toDateString(); //toLocaleString(navigator.language, { dateStyle: 'short'});
              setStatus('Last Seen ' + date);
            } else {
              const options = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              };
              const date = data.toDate().toLocaleTimeString(undefined, options); //toLocaleString(navigator.language, { dateStyle: 'short'});
              setStatus(`Last Seen ${dayName} ${date}`);
            }
          }
        });
    };
    otherMessengerRef();
    messageRef.onSnapshot(querySnap => {
      const allMsg = querySnap.docs.map(docSnap => {
        const data = docSnap.data();

        if (data.createdAt) {
          return {
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt.toDate(),
          };
        } else {
          return {
            ...docSnap.data(),
            createdAt: new Date(),
          };
        }
      });
      setMessages(allMsg);
    });
  }, []);

  const VideoCallHandler = () => {
    try {
      if (activeCallers.includes(uid) || activeCallers.includes(user.uid)) {
        Alert.alert("user is already on call");
        return;
      } else {
        const callId = user.uid + '_' + uid;
        const callRef = firestore().collection('calls').doc(callId);
        callRef
          .set({
            caller: user.uid,
            callae: uid,
            channel: docId,
            status: 'initiated',
            timestamp: new Date(),
          })
          .then(() => {
            navigation.navigate('InCall', {
              channel: callId,
              callId: callId,
            });

            console.log('call added');
          });
      }
    } catch (error) {
      Alert.alert('something went wrong');
    }
  };

  const onSend = messagesArray => {
    const msg = messagesArray[0];
    const myMsg = {
      ...msg,
      sentBy: user.uid,
      sendTo: uid,
      createdAt: new Date(),
    };

    setMessages(previousMessages => GiftedChat.append(previousMessages, myMsg));
    firestore()
      .collection('chatrooms')
      .doc(docId)
      .collection('messages')
      .add({...myMsg, createdAt: firestore.FieldValue.serverTimestamp()});
  };

  function textChangeHandler() {
    const userRef = firestore().collection('users').doc(user.uid);
    userRef.update({
      status: 'typing...',
    });
    setTimeout(() => {
      userRef.update({
        status: 'online',
      });
    }, 2000);
  }
  function handleToggleModal() {
    setIsModelVisible(!isModalVisible);
  }

  async function blockOptionHandler(personId, state) {
    if (status === FriendRequestStatus.BLOCK) {
      setDisableInputState(true);
      setAccountState(state);
    } else {
      setDisableInputState(false);
      setAccountState(state);
    }

    await updateFriendRequestStatus(user.uid, personId, state);
    await updateFriendRequestStatus(personId, user.uid, state);
  }

  return (
    <View style={{flex: 1, justifyContent: 'flex-start'}}>
      <UserOptions
        visibility={isModalVisible}
        handleToggle={handleToggleModal}
        userId={uid}
        blockOption={(personId, blockingState) =>
          blockOptionHandler(personId, blockingState)
        }
        accountState={accountState}
      />
      <View style={styles.header}>
        <Image style={styles.headerImage} source={{uri: route.params.pic}} />
        <View style={styles.texts}>
          <Text style={[styles.text, {fontSize: 20, color: 'blue'}]}>
            {route.params.name}
          </Text>
          <Text style={styles.text}>{status}</Text>
        </View>
        <View style={{flexDirection: 'row', position: 'absolute', right: 10,}} onPress={handleToggleModal}>
          <MaterialIcons
            name="videocam"
            size={28}
            color="blue"
            style={{marginRight: 15}}
            onPress={VideoCallHandler}
          />
          <Icon
            name="options-vertical"
            size={23}
            color="blue"
            onPress={handleToggleModal}
          />
        </View>
      </View>
      {disableInputState && (
        <Text style={[styles.text, {color: 'red', textAlign: 'center'}]}>
          You have blocked each other. Can't send messages
        </Text>
      )}

      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user.uid,
        }}
        onInputTextChanged={textChangeHandler}
        disableComposer={disableInputState}
        renderBubble={props => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: '#2bb583',
                  marginLeft: '-13%',
                },
                right: {
                  // backgroundColor: 'blue',
                },
              }}
              textStyle={{
                left: {
                  color: 'white',
                },
              }}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: 50,
    height: 50,
    borderRadius: 29,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    elevation: 4,
    shadowColor: 'blue',
    borderBottomWidth: 0.1,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: 'grey',
  },
  texts: {
    paddingLeft: 20,
  },
});
