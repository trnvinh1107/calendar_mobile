import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const DetailBookingRoom = ({ route }) => {
  const { selectedDate } = route.params;
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      const user = JSON.parse(await AsyncStorage.getItem("currentUser"));
      setUser(user);
      setIsAdmin(user.isAdmin);

      const clickedDate = new Date(selectedDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      setIsPastDate(clickedDate < currentDate);

      try {
        const response = await axios.get(`http://localhost:8081/api/v1/bookingroom/date?date=${selectedDate}`);
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  useEffect(() => {
    const fetchUserNamesForBookings = async () => {
      const newUserNames = { ...userNames };

      for (const booking of bookings) {
        if (!newUserNames[booking.userId]) {
          newUserNames[booking.userId] = await fetchUserName(booking.userId);
        }
      }

      setUserNames(newUserNames);
    };

    fetchUserNamesForBookings();
  }, [bookings]);

  const handleEdit = (bookingId) => {
    navigation.navigate("EditBookingRoom", { bookingId, selectedDate });
  };

  const handleDelete = async (bookingId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa phòng đã đặt này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await axios.delete(`http://localhost:8081/api/v1/bookingroom/${bookingId}`, {
                headers: {
                  Authorization: `Bearer ${await AsyncStorage.getItem("apiToken")}`,
                },
              });
              setBookings(bookings.filter((booking) => booking.id !== bookingId));
            } catch (error) {
              console.error("Error deleting booking:", error);
            }
          },
        },
      ]
    );
  };

  const fetchUserName = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("apiToken")}`,
          },
        }
      );
      return response.data.userName;
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  return (
    <View style={styles.container}>
      {!isPastDate && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddBookingRoom", { selectedDate })}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}
      {bookings.length === 0 ? (
        <Text style={styles.noBookingText}>Chưa có lịch được đặt</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.bookingItem}>
              <Text style={styles.bookingText}>Room: {item.roomId}</Text>
              <Text style={styles.bookingText}>UserName: {userNames[item.userId] || "Loading..."}</Text>
              <Text style={styles.bookingText}>Start: {item.startTime}</Text>
              <Text style={styles.bookingText}>End: {item.endTime}</Text>
              {!isPastDate && (user.userId === item.userId || isAdmin) && (
                <View style={styles.buttons}>
                  <TouchableOpacity onPress={() => handleEdit(item.id)}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  addButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#00adf5",
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  noBookingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#888",
  },
  bookingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  bookingText: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    color: "blue",
  },
  deleteButton: {
    color: "red",
  },
});

export default DetailBookingRoom;
