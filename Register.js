import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Kiểm tra xem userName đã tồn tại chưa
      const checkUserNameResponse = await axios.get(
        `http://localhost:8081/api/v1/users/check/${formData.userName}`
      );

      if (checkUserNameResponse.data) {
        setError("Username already exists");
        return;
      }

      // Tiếp tục đăng ký nếu userName chưa tồn tại
      const response = await axios.post(
        "http://localhost:8081/api/v1/users",
        {
          ...formData,
          isAdmin: false, // Set isAdmin to false by default
        }
      );

      console.log("formData registered successfully:", response.data);
      Alert.alert("Success", "Đăng ký thành công, nhấn OK để chuyển đến trang đăng nhập", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.error("Error registering formData:", error);
      setError("Registration failed. Please try again.");
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Enter User Name"
        onChangeText={(value) => handleChange("userName", value)}
        value={formData.userName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter First Name"
        onChangeText={(value) => handleChange("firstName", value)}
        value={formData.firstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Last Name"
        onChangeText={(value) => handleChange("lastName", value)}
        value={formData.lastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        onChangeText={(value) => handleChange("email", value)}
        value={formData.email}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        onChangeText={(value) => handleChange("password", value)}
        value={formData.password}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        onChangeText={(value) => handleChange("confirmPassword", value)}
        value={formData.confirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backToLogin}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backToLogin: {
    color: "#128dd3",
    textDecorationLine: "underline",
    marginTop: 20,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default Register;
