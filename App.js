import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./Login";
import Register from "./Register";
import AddBookingRoom from "./AddBookingRoom";
import EditBookingRoom from "./EditBookingRoom";
import DetailBookingRoom from "./DetailBookingRoom";
import Calendar from "./Calendar";
import { Button } from 'react-native';

const Stack = createStackNavigator();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    };

    checkUser();
  }, []);

  const handleLogin = async (user) => {
    setCurrentUser(user);
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
    await AsyncStorage.setItem("apiToken", user.apiToken);
  };
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"Login"}>
        <Stack.Screen name="Login" options={{ headerLeft: null }}>
          {(props) => <Login {...props} onLogin={handleLogin}/>}
        </Stack.Screen>
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Calendar" options={{ headerLeft: null }}>
          {(props) => <Calendar {...props} />}
        </Stack.Screen>
        <Stack.Screen name="AddBookingRoom" component={AddBookingRoom} />
        <Stack.Screen name="EditBookingRoom" component={EditBookingRoom} />
        <Stack.Screen name="DetailBookingRoom" component={DetailBookingRoom} 
         options={({ navigation }) => ({
          headerLeft: () => (
            <Button
              onPress={() => {
                navigation.replace('Calendar');
              }}
              title="Back"
            />
          ),
        })} 
        />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
