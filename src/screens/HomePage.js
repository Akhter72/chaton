import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {FAB} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from '@react-native-community/netinfo';
import {
  fetchUserFriends,
  fetchUsers,
  sendFriendRequest,
} from '../services/userServices';
import {deleteUnRespondedCalls} from '../utils/utilFunctions';
export default function HomePage({user, navigation}) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  // sendFriendRequest(user.uid, 'UAWkbl34OdNu4bYJvT1170uuILD3');
  useEffect(() => {
    async function loadData() {
      const allUsers = await fetchUserFriends(user.uid);
      setUsers(allUsers);
    }
    loadData();
  }, [users]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('calls')
      .onSnapshot(querySnapshot => {
        let callData = null;

        querySnapshot.forEach(docSnapshot => {
          const data = docSnapshot.data();
          if (data?.callae === user.uid) {
            callData = data;
            if (data.status === 'initiated') {
              navigation.navigate('GettingCall', {
                channel: docSnapshot.id,
                callId: docSnapshot.id,
              });
            } else if (data.status === 'Recieved') {
              navigation.navigate('InCall', {
                channel: docSnapshot.id,
                callId: docSnapshot.id,
              });
            }
          } else {
            callData = data ? data : null;
          }
        });

        if (!callData) {
          navigation.navigate('Home');
        }
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const callsRef = firestore()
      .collection('calls')
      .where('status', '==', 'initiated');
    const unsubscribe = callsRef.onSnapshot(querySnapShot => {
      querySnapShot.forEach(docSnapShot => {
        const createdAt = docSnapShot.data().timestamp;
        const currentDate = new Date();
        const timeDiff = currentDate - createdAt.toDate();
        if (timeDiff > 30000) {
          docSnapShot.ref.delete().then(() => console.log('deleted'));
        }
      });
    });
  }, [users]);

  const RenderCard = ({item}) => {
    const friend = item.friends.find(friend => {
      return friend.friendId === user.uid;
    });
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('chat', {
            name: item.name,
            uid: item.uid,
            pic: item.pic,
            accountState: friend.status,
          })
        }>
        <View style={styles.myCard}>
          <Image source={{uri: item.pic}} style={styles.img} />
          <Text style={styles.text}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{flex: 1}}>
      <FlatList
        data={users}
        renderItem={({item}) => {
          return <RenderCard item={item} />;
        }}
        keyExtractor={item => item.uid}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        color="black"
        onPress={() => navigation.navigate('AddFriend')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: {width: 50, height: 50, borderRadius: 30, backgroundColor: 'green'},
  text: {
    fontSize: 24,
    marginLeft: 15,
    color: 'grey',
  },
  myCard: {
    flexDirection: 'row',
    margin: 3,
    padding: 4,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
});
