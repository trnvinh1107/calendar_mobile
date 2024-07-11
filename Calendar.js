import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import DetailBookingRoom from './DetailBookingRoom';
import { useNavigation } from "@react-navigation/native";
import { CalendarList } from "react-native-calendars";
import Modal from "react-native-modal";

const Calendar = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [dayOffs, setDayOffs] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [name, setName] = useState(null);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUser");
        if (storedUser) {
          setName(JSON.parse(storedUser).userName);
        }
        // console.log("abcasd: " + currentUser.userName);
        const [eventsResponse, dayOffsResponse] = await Promise.all([
          axios.get("http://localhost:8081/api/v1/bookingroom"),
          axios.get("http://localhost:8081/api/v1/dayoff"),
        ]);

        const bookingEvents = eventsResponse.data.map((booking) => ({
          id: booking.id,
          title: `Room ${booking.roomId}`,
          start: booking.startTime,
          end: booking.endTime,
          color: booking.color,
        }));

        const dayOffEvents = dayOffsResponse.data.map((dayOff) => ({
          id: dayOff.id,
          title: "dayOff",
          start: dayOff.dayOff,
          isDayOff: true,
          name: dayOff.name,
          description: dayOff.description,
        }));

        setEvents(bookingEvents);
        setDayOffs(dayOffEvents);
        const marked = {};
        bookingEvents.forEach((event) => {
          const date = event.start.split("T")[0];
          marked[date] = { marked: true, dotColor: event.color };
        });
        dayOffEvents.forEach((event) => {
          const date = event.start.split("T")[0];
          marked[date] = { marked: true, dotColor: "red" };
        });
        setMarkedDates(marked);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDayPress = (day) => {
    const clickedDate = new Date(day.dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const dayOff = dayOffs.find((dayOff) => {
      const dayOffDate = new Date(dayOff.start);
      dayOffDate.setHours(7, 0, 0, 0);
      return dayOffDate.toDateString() === clickedDate.toDateString();
    });

    if (dayOff) {
      Alert.alert(
        "Thông báo",
        `Không được đặt phòng vào ngày nghỉ.\n${dayOff.description}`
      );
    } else {
      navigation.navigate('DetailBookingRoom', { selectedDate: day.dateString });
    }
  };

  const handleLogout = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("currentUser"));
    await axios.post(
      `http://localhost:8081/api/v1/users/logout/${user.userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("apiToken")}`,
        },
      }
    );
    await AsyncStorage.removeItem("apiToken");
    await AsyncStorage.removeItem("currentUser");
    navigation.replace("Login");
  };
  return (
    <View style={styles.container}>
      <View style={styles.account}>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>Welcome {name}</Text>
      </View>
      <CalendarList
        onDayPress={handleDayPress}
        
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#00adf5",
          todayTextColor: "#00adf5",
        }}
      />
      <Modal>
        <View style={styles.modalContent}>
          <DetailBookingRoom
            selectedDate={selectedDate}
          />
        </View>
      </Modal>
      <Modal>
        <View style={styles.modalContent}>
          <Text>Detail Booking Room Component</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  logout: {
    marginRight: 30,
  },
  account:{
    flexDirection: "row-reverse",

  },
  logoutText: {
    color: "blue",
    textDecorationLine: 'underline',
  },
  userName:{
    marginRight:30,
    color: "black",
  }
});

export default Calendar;
