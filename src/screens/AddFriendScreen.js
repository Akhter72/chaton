import React, {Component, useEffect, useState} from 'react';
import {Text, View, FlatList, Image, StyleSheet} from 'react-native';
import {TextInput} from 'react-native-paper';
import {fetchMyNonFriendUsers, fetchUsers, sendFriendRequest} from '../services/userServices';
import Icon from 'react-native-vector-icons/Feather';
import { FriendRequestStatus } from '../constants/VariableConstants';

export default function AddFriendScreen({user, navigation}) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  useEffect(() => {
    async function loadData() {
      const allUsers = await fetchMyNonFriendUsers(user.uid);
      setUsers(allUsers);
    }
    loadData();
  }, []);


  function RenderCard({item}) {
    async function sendFriendRequestHandler() {
      await sendFriendRequest(user.uid, item.uid, FriendRequestStatus.SENT);
      await sendFriendRequest(item.uid, user.uid, FriendRequestStatus.REQUESTED);
      navigation.goBack();
    }
      
    return (
      <View style={styles.myCard}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={{uri: item.pic}} style={styles.img} />
          <Text style={styles.text}>{item.name}</Text>
        </View>
        <Icon 
          name="plus-square" 
          size={35}
          color="blue"
          style={{marginRight: 10}}
          onPress={sendFriendRequestHandler}
        />
      </View>
    );
  }

  function textChangeHandler(text) {
    if(text.length === 0) {
      setSelectedUsers([]);
      return;
    }
    const fillUsers  = users.filter(user => {
      return user.name.toLowerCase().includes(text.toLowerCase());
    })
    setSelectedUsers(fillUsers)
  }
  return (
    <View>
      <TextInput style={{backgroundColor: 'cream', borderWidth: 1,}} textColor='grey' placeholder="enter friends nam" onChangeText={(text) => textChangeHandler(text)}/>
      <FlatList
        data={selectedUsers}
        renderItem={({item}) => {
          return <RenderCard item={item} />;
        }}
        keyExtractor={item => item.uid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    width: 50, 
    height: 50, 
    borderRadius: 30, 
    backgroundColor: 'green'
  },
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
    justifyContent: 'space-between'
  },
});
