import { View, Text, FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import MyBookingsHeader from "./components/Header";
import { BookingAPI } from "../../../api/bookings";
import { Booking } from "../../../types/booking";
import { Colors } from "../../../constant/colors";
import Typography from "../../../components/ui/Typography";
import dayjs from "dayjs";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#10B981",
  PENDING: "#F59E0B",
  CANCELLED: "#EF4444",
  EXPIRED: "#9CA3AF",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingAPI.myBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <MyBookingsHeader />
      {loading ? (
        <Text style={styles.hint}>Loading bookings...</Text>
      ) : bookings.length === 0 ? (
        <Text style={styles.hint}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Typography variant="h3">{item.room.roomType.property.title}</Typography>
                <Text style={[styles.badge, { color: STATUS_COLORS[item.bookingStatus] ?? Colors.TEXT_GRAY }]}>
                  {item.bookingStatus.charAt(0) + item.bookingStatus.slice(1).toLowerCase()}
                </Text>
              </View>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                {item.room.roomLabel} · Seat {item.seatNumber} · {item.durationMonths} months
              </Typography>
              <Typography variant="caption">
                {dayjs(item.leaseStart).format("MMM YYYY")} - {dayjs(item.leaseEnd).format("MMM YYYY")}
              </Typography>
              <Typography variant="h3" style={{ marginTop: 8 }}>
                LKR {Number(item.totalAmount).toLocaleString()}
              </Typography>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default MyBookings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: Colors.WHITE,
    padding: 20,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
  },
  hint: {
    textAlign: "center",
    marginTop: 48,
    color: Colors.TEXT_GRAY,
  },
});