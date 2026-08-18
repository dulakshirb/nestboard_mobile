import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react-native";
import { BookingAPI } from "../../../api/bookings";
import { Booking } from "../../../types/booking";
import { Colors } from "../../../constant/colors";
import Typography from "../../../components/ui/Typography";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RoundButton from "../../../components/ui/RoundButton";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  CONFIRMED: { color: '#10B981', bg: '#D1FAE5' },
  PENDING: { color: '#D97706', bg: '#FEF3C7' },
  CANCELLED: { color: '#DC2626', bg: '#FEE2E2' },
  EXPIRED: { color: '#9CA3AF', bg: '#F3F4F6' },
};

const ACTIVE_STATUSES = ['CONFIRMED', 'PENDING'];
const PAST_STATUSES = ['CANCELLED', 'EXPIRED'];

const MyBookings = () => {
  const nav: any = useNavigation();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingAPI.myBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await BookingAPI.cancelBooking(id);
            setBookings((prev) =>
              prev.map((b) =>
                b.id === id
                  ? { ...b, bookingStatus: "CANCELLED" as const }
                  : b,
              ),
            );
          } catch {
            Alert.alert("Error", "Could not cancel booking.");
          }
        },
      },
    ]);
  };

  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.bookingStatus));
  const pastBookings = bookings.filter((b) => PAST_STATUSES.includes(b.bookingStatus));

  const renderBookingCard = (item: Booking, showLeftBar: boolean) => {
    const statusStyle = STATUS_STYLES[item.bookingStatus] ?? { color: Colors.TEXT_GRAY, bg: '#F3F4F6' };

    return (
      <View style={styles.cardWrapper}>
        {showLeftBar && (
          <View style={[styles.leftBar, { backgroundColor: statusStyle.color }]} />
        )}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Typography variant="h2">{item.room.roomType.property.title}</Typography>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                {item.room.roomLabel} · Seat {item.seatNumber}
              </Typography>
              <Typography variant="body" color={Colors.TEXT_GRAY}>
                {dayjs(item.leaseStart).format("MMM YYYY")} to {dayjs(item.leaseEnd).format("MMM YYYY")}
              </Typography>
              <Typography variant="h3" style={{ marginTop: 4 }}>
                LKR {Number(item.totalAmount).toLocaleString()} paid
              </Typography>
            </View>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                {item.bookingStatus}
              </Text>
            </View>
          </View>
          {item.bookingStatus === "PENDING" && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => cancelBooking(item.id)}
            >
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <RoundButton
          Icon={<ArrowLeft color={Colors.SECONDARY_COLOR} size={20} />}
          onPress={() => nav.goBack()}
        />
        <View style={styles.titleWrap}>
          <Typography variant="h2">{"My Bookings"}</Typography>
        </View>
      </View>

      {loading ? (
        <Text style={styles.hint}>Loading bookings...</Text>
      ) : bookings.length === 0 ? (
        <Text style={styles.hint}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={() => (
            <>
              {activeBookings.length > 0 && (
                <View style={styles.section}>
                  <Typography variant="body" color={Colors.TEXT_GRAY}>Active</Typography>
                  <View style={styles.sectionCards}>
                    {activeBookings.map((item) => (
                      <View key={item.id}>
                        {renderBookingCard(item, item.bookingStatus === 'CONFIRMED')}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {pastBookings.length > 0 && (
                <View style={styles.section}>
                  <Typography variant="body" color={Colors.TEXT_GRAY}>Past</Typography>
                  <View style={styles.sectionCards}>
                    {pastBookings.map((item) => (
                      <View key={item.id}>
                        {renderBookingCard(item, item.bookingStatus === 'CANCELLED')}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
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
  header: {
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  titleWrap: {
    flex: 1,
    justifyContent: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 15,
  },
  sectionCards: {
    marginTop: 16,
    gap: 16,
  },
  cardWrapper: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  leftBar: {
    width: 4,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 24,
    gap: 8,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  hint: {
    textAlign: "center",
    marginTop: 48,
    color: Colors.TEXT_GRAY,
  },
  cancelBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
});
