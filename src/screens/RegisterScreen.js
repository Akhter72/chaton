import React, {useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegisterScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [goNext, setGoNext] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  function goNextHandler() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Please select All above inputs first');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords does not match');
      return;
    }
    setGoNext(true);
  }

  async function signUpHandler() {
    if (!name || !image) {
      Alert.alert('please Select Inputs');
      return;
    }
    setLoading(true)
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password);
      firestore().collection('users').doc(result.user.uid).set({
        name: name,
        email: result.user.email,
        uid: result.user.uid,
        pic: image,
        status: 'online',
        friends: [],
      });
    } catch (err) {
      Alert.alert('error in registering');
    }
    setLoading(false);
  }

  const pickImageAndUpload = () => {
    try{
    launchImageLibrary({quality: 0.5}, fileObj => {
      console.log(fileObj.didCancel)
      if(!fileObj.didCancel) {
      const uploadTask = storage()
        .ref()
        .child(`/userprofile/${Date.now()}`)
        .putFile(fileObj.assets[0].uri);
      
      uploadTask.on(
        'state_changed',
        snapshot => {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress == 100) Alert.alert('image uploaded');
        },
        error => {
          Alert.alert('error uploading image');
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            setImage(downloadURL);
          });
        },
      );
      }
    });
  } catch(error) {
    Alert.alert("Error in uploading picture", error.message);
    return;
  }
  };

if (loading) {
  return <ActivityIndicator size="large" color="blue" />;
}


  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <View style={styles.logoContainer}>
        <Image source={require('../assets/ChatOn-logo.png')} />
      </View>
      <View style={styles.inputContainer}>
        {goNext && (
          <>
            <TextInput
              style={styles.margin}
              label="Full name"
              value={name}
              mode="outlined"
              onChangeText={text => setName(text)}
            />
            <Button
              style={styles.margin}
              mode="elevated"
              onPress={pickImageAndUpload}>
              Upload Image
            </Button>
            <Button
              style={styles.margin}
              mode="contained"
              onPress={() => setGoNext(false)}>
              Back
            </Button>
            <Button
              style={styles.margin}
              mode="contained"
              disabled={image ? false : true}
              onPress={signUpHandler}>
              Sign Up
            </Button>
          </>
        )}

        {!goNext && (
          <>
            <TextInput
              style={styles.margin}
              label="email"
              value={email}
              mode="outlined"
              onChangeText={text => setEmail(text)}
            />
            <TextInput
              style={styles.margin}
              label="password"
              value={password}
              mode="outlined"
              secureTextEntry
              onChangeText={text => setPassword(text)}
            />
            <TextInput
              style={styles.margin}
              label="confirm password"
              value={confirmPassword}
              mode="outlined"
              onChangeText={text => setConfirmPassword(text)}
            />
            <Button
              style={styles.margin}
              mode="contained"
              onPress={goNextHandler}>
              Next
            </Button>
          </>
        )}
      </View>
      <Button
        style={{alignSelf: 'center', marginTop: 10}}
        onPress={() => {
          navigation.navigate('login');
        }}>
        Already have an account ?
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  margin: {
    marginTop: 20,
    minWidth: '80%',
    maxWidth: '80%',
  },
  loginText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
});
