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
import auth from '@react-native-firebase/auth';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function loginHandler() {
    setLoading(true);
    if (!email || !password) {
      Alert.alert('please Fill all the fields');
      return;
    }

    const result = await auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        Alert.alert(error.code);
      })
      setLoading(false);

  }

  if (loading) {
    return <ActivityIndicator color="blue" size="large" />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <View style={styles.logoContainer}>
        <Text style={styles.loginText}>Connecting Kashmir</Text>
        <Image source={require('../assets/ChatOn-logo.png')} />
      </View>
      <View style={styles.inputContainer}>
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
        <Button style={styles.margin} mode="contained" onPress={loginHandler}>
          Login
        </Button>
      </View>
      <Button
        style={{alignSelf: 'center', marginTop: 10}}
        onPress={() => {
          navigation.navigate('register');
        }}>
        Create a new account ?
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
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginTop: 10,
    alignItems: 'center',
    color: 'grey'
  },
  margin: {
    marginTop: 15,
    minWidth: '80%',
    maxWidth: '80%',
  },
  loginText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
});
