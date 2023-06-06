import React, {useState} from 'react';
import {Text, StyleSheet, View, Modal, TouchableOpacity} from 'react-native';
import { FriendRequestStatus } from '../../constants/VariableConstants';

export default function UserOptions({visibility, handleToggle, blockOption, userId, accountState}) {
  const [optionText, setOptionText] = useState(accountState===FriendRequestStatus.BLOCK ? "Unblock" : "Block");
  const [blockState, setBlockState] = useState(accountState===FriendRequestStatus.BLOCK ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.BLOCK);
  return (
    <Modal
      visible={visibility}
      transparent={true}
      onRequestClose={handleToggle}>
      <TouchableOpacity
        onPress={handleToggle}
        style={{
          flex: 1,
          alignItems: 'flex-end',
          
        }}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              // blockOption(userId, blockState);
              handleToggle();
            }}
            style={{marginBottom: 8}}>
            <Text>{optionText}</Text>
          </TouchableOpacity>

        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    maxWidth: '60%',
    minWidth: '30%',
    marginTop: '17%',
    alignItems: 'flex-start'
  },
});
