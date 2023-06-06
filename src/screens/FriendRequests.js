import React, {Component, useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {fetchMyFriendRequests, updateFriendRequestStatus} from '../services/userServices';
import {
  FriendRequestStatus,
  UpdateFriendRequestType,
} from '../constants/VariableConstants';

export default function FriendRequests({user, navigation}) {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    async function loadData() {
      const friendRequests = await fetchMyFriendRequests(user.uid);
      setRequests(friendRequests);
    }
    loadData();
  }, []);

  async function updateFriendRequestHandler(friendId, type) {
    const status =
      type === UpdateFriendRequestType.ACCEPT
        ? FriendRequestStatus.ACCEPTED
        : FriendRequestStatus.REJECTED;
    await updateFriendRequestStatus(user.uid, friendId, status);
    await updateFriendRequestStatus(friendId, user.uid, status);
    navigation.goBack();
  }

  function RenderCard({item}) {
    const userId = item.uid;
    return (
      <View style={styles.myCard}>
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 2}}>
          <Image source={{uri: item.pic}} style={styles.img} />
          <Text style={styles.text}>{item.name}</Text>
        </View>
        <View style={styles.icons}>
          <View style={[styles.icon, {backgroundColor: 'green'}]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                updateFriendRequestHandler(userId, UpdateFriendRequestType.ACCEPT)
              }>
              <Text style={styles.buttonStyle}>Accept</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.icon, {backgroundColor: 'red'}]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => updateFriendRequestHandler(userId, UpdateFriendRequestType.REJECT)}>
              <Text style={styles.buttonStyle}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={requests}
        renderItem={({item}) => {
          return <RenderCard item={item} />;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'green',
    marginLeft: 10,
  },
  text: {
    fontSize: 24,
    marginLeft: 20,
    color: 'grey',
  },
  myCard: {
    backgroundColor: 'white',
    borderBottomColor: 'grey',
    borderTopWidth: 0.5,
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 26,
    marginTop: 5,
  },
  icon: {
    backgroundColor: 'green',
    alignItems: 'center',
    backgroundColor: 'blue',
    width: '50%',
  },
  buttonStyle: {
    color: 'white',
    fontSize: 16,
    // width: "20%",
    textAlign: 'center',
    // backgroundColor: 'blue',
  },
  button: {
    width: '100%',
  },
});
