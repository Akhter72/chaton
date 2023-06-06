import firestore from '@react-native-firebase/firestore';
import {FriendRequestStatus} from '../constants/VariableConstants';

export async function fetchUsers() {
  const querySnap = await firestore().collection('users').get();
  const allUsers = querySnap.docs.map(docSnap => docSnap.data());
  return allUsers;
}

export async function fetchUser(id) {
  const response = await firestore().collection('users').doc(id).get();
  const user = response.data();
  return user;
}

export async function fetchUserFriends(id) {
  const allUsers = await fetchUsers();
  const user = await fetchUser(id);
  const userFriendIds = user.friends;
  var friends = [];
  userFriendIds.forEach(friend => {
    allUsers.forEach(user => {
      if (friend.friendId === user.uid && ['Accepted', 'Block'].includes(friend.status)) {
        friends.push(user);
      }
    });
  });
  // console.log([...new Set(friends)])
  return [...new Set(friends)];
}

export async function sendFriendRequest(userId, friendId, status) {
  const user = await fetchUser(userId);
  user.friends = user.friends ? user.friends : [];
  user.friends.push({
    friendId: friendId,
    status: status,
  });
  const userRef = firestore().collection('users').doc(userId);
  userRef.update(user);
}

export async function updateFriendRequestStatus(userId, friendId, status) {
  const user = await fetchUser(userId);
  user.friends = user.friends ? user.friends : [];
  const selectedFriend = user.friends.filter(friend => {
    if(friend.friendId == friendId){
      friend.status = status;
    }
    return friend;
    
  })
  const userRef = firestore().collection('users').doc(userId);
  userRef.update({
    friends: selectedFriend
  });
}

export async function fetchMyNonFriendUsers(id) {
  var allUsers = await fetchUsers();
  const user = await fetchUser(id);
  const userFriends = user.friends;
  allUsers = allUsers.filter(user => {
    return user.uid !== id;
  });
  const friendIds = userFriends.map(user => {
    return user.friendId;
  });

  if (friendIds.length === 0) {
    return allUsers;
  } else {
    const a = allUsers.filter(user => {
      return !friendIds.includes(user.uid);
    });
    return a;
  }
}


export async function fetchMyFriendRequests(id) {
  const user = await fetchUser(id);
  const allUsers = await fetchUsers();
  const friends = user.friends;
  const userRequestedFriendIds = friends.map(friend => {
    if(friend.status === FriendRequestStatus.REQUESTED)
    return friend.friendId
  })
  const userRequestedFriends = allUsers.filter(user => {
    return userRequestedFriendIds.includes(user.uid)
  });

  return userRequestedFriends;

}