import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
function Login({ onLogin, navigation }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, password }),
        }
      );

      if (response.ok) {
        const user = await response.json();
        console.log("Login successful:", user);

        onLogin(user); // Trigger the login function passed from parent component
        // You can store data using AsyncStorage in React Native instead of localStorage
        AsyncStorage.setItem('currentUser', JSON.stringify(user));
        navigation.replace("Calendar"); // Navigate to the calendar screen after successful login
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="Username"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Don't have an account?{" "}
        <Text
          style={styles.registerLink}
          onPress={() => navigation.navigate("Register")}
        >
          Register
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#04AA6D",
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 20,
  },
  registerText: {
    color: "#128dd3",
    marginTop: 20,
  },
  registerLink: {
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default Login;
