import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditBookingRoom = ({ navigation, route }) => {
  const { bookingId, selectedDate } = route.params;
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [roomInit, setRoomInit] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/v1/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/v1/bookingroom/${bookingId}`
        );
        const booking = response.data;
        setSelectedRoom(booking.roomId);
        setDescription(booking.description);
        setStartTime(new Date(booking.startTime));
        setEndTime(new Date(booking.endTime));
        setRoomInit(booking.roomId);
        setSelectedColor(booking.color || "");
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    fetchCurrentUser();
    fetchRooms();
    fetchBookingDetails();
  }, [bookingId]);

  const handleUpdateBooking = async () => {
    if (!selectedRoom) {
      setBookingMessage("Vui lòng chọn 1 phòng.");
      return;
    }

    if (endTime <= startTime) {
      setBookingMessage("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    const [year, month, day] = selectedDate.split("-");
    const selectedDateObject = new Date(year, month - 1, day);

    const formatDateTimeISO = (date, time) => {
      const hours = String(time.getHours()).padStart(2, "0");
      const minutes = String(time.getMinutes()).padStart(2, "0");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    };

    const formattedStartTime = formatDateTimeISO(selectedDateObject, startTime);
    const formattedEndTime = formatDateTimeISO(selectedDateObject, endTime);

    try {
      const checkConflictResponse = await axios.get(
        `http://localhost:8081/api/v1/bookingroom/check`,
        {
          params: {
            roomId: selectedRoom,
            startTime: formattedStartTime,
            endTime: formattedEndTime, 
            exceptedId: bookingId,
          },
        }
      );
      console.log(roomInit + " abc " + selectedRoom);
        if (checkConflictResponse.data.conflict) {
          setBookingMessage(
            "Phòng này đã có người đặt trước trong thời gian bạn chọn."
          );
          return;
        }
      await axios.put(`http://localhost:8081/api/v1/bookingroom/${bookingId}`, {
        userId: currentUser.userId,
        roomId: selectedRoom,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        description: description,
        color: selectedColor, 
      });

      Alert.alert("Thông báo", "Chỉnh sửa đặt phòng thành công!");
      navigation.replace("DetailBookingRoom", { selectedDate });
    } catch (error) {
      console.error("Error updating booking:", error);
      setBookingMessage("Chỉnh sửa đặt phòng không thành công.");
    }
  };

  const onChangeStartTime = (event, selectedDate) => {
    const currentDate = selectedDate || startTime;
    setShowStartTimePicker(Platform.OS === "ios");
    setStartTime(currentDate);
  };

  const onChangeEndTime = (event, selectedDate) => {
    const currentDate = selectedDate || endTime;
    setShowEndTimePicker(Platform.OS === "ios");
    setEndTime(currentDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Chọn phòng:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedRoom}
          onValueChange={(itemValue) => setSelectedRoom(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Chọn phòng --" value="" />
          {rooms.map((room) => (
            <Picker.Item key={room.id} label={room.name} value={room.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.labelMargin}>Mô tả:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mô tả"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.labelColor}>Chọn màu:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedColor}
          onValueChange={(itemValue) => setSelectedColor(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Blue" value="#4285F4" />
          <Picker.Item label="Green" value="#34A853" />
          <Picker.Item label="Red" value="#EA4335" />
          <Picker.Item label="Yellow" value="#FBBC05" />
        </Picker>
      </View>
      <Text style={styles.labelMargin}>Thời gian bắt đầu:</Text>
      <Button
        onPress={() => setShowStartTimePicker(true)}
        title="Chọn thời gian bắt đầu"
      />
      {showStartTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          style={styles.pickerDate}
          onChange={onChangeStartTime}
        />
      )}

      <Text style={styles.label}>Thời gian kết thúc:</Text>
      <Button
        onPress={() => setShowEndTimePicker(true)}
        title="Chọn thời gian kết thúc"
      />
      {showEndTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeEndTime}
          style={styles.pickerDate}
        />
      )}

      <Text style={styles.message}>{bookingMessage}</Text>

      <Button title="Cập nhật đặt phòng" onPress={handleUpdateBooking} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  labelMargin: {
    marginTop: 50,
    fontWeight: "bold",
  },
  labelColor: {
    marginVertical: 20,
    fontWeight: "bold",
  },
  pickerDate: {
    marginHorizontal: 160,
    marginVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    height: 50,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  message: {
    color: "red",
    marginBottom: 10,
  },
});

export default EditBookingRoom;
