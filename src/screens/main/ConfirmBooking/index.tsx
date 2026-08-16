import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import ConfirmScreenHeader from "./components/Header";
import Typography from "../../../components/ui/Typography";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import RegularButton from "../../../components/ui/RegularButton";
import { Lock } from "lucide-react-native";
import { BookingAPI } from "../../../api/bookings";
import { Colors } from "../../../constant/colors";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

import dayjs from "dayjs";
import { formatNumberIntoCurrency } from "../../../util/common";

const Months: string[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();

const Years: number[] = [currentYear, currentYear + 1, currentYear + 2];

// Converts a picker value like "2026-Jul" into "2026-07"
const toMonthIso = (pickerValue: string) => {
  const [year, monthAbbr] = pickerValue.split("-");
  const index = Months.indexOf(monthAbbr);
  if (!year || index < 0) return null;
  return `${year}-${String(index + 1).padStart(2, "0")}`;
};

const ConfirmBooking = () => {
  const nav: any = useNavigation();

  const currentProperty = useSelector((state: RootState) => state.property.currentProperty);
  const roomId = useSelector((state: RootState) => state.booking.data?.roomId);
  const roomName = useSelector((state: RootState) => state.booking.data?.roomName);
  const seatIndex = useSelector((state: RootState) => state.booking.data?.seatIndex);
  const pricePerSeat = useSelector((state: RootState) => state.booking.data?.pricePerSeat);

  const [fromDate, setFromDate] = useState(Years[0] + "-" + Months[0]);
  const [toDate, setToDate] = useState(Years[0] + "-" + Months[0]);
  const [duration, setDuration] = useState(0);

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => (parseFloat(pricePerSeat + "") * duration).toFixed(2),
    [pricePerSeat, duration],
  );

  useEffect(() => {
    if (fromDate && toDate) {
      const sd = dayjs(fromDate, "YYYY-MMM");
      const td = dayjs(toDate, "YYYY-MMM");
      const diff = td.diff(sd, "month");
      if (diff < 0) {
        setToDate(fromDate);
      } else {
        setDuration(diff);
      }
    }
  }, [fromDate, toDate]);

  const bookNow = async () => {
    setError(null);
    const startMonth = toMonthIso(fromDate);

    if (!roomId || !seatIndex || !startMonth || duration < 1) {
      setError("Pick a valid lease period first");
      return;
    }

    setBooking(true);
    try {
      const created = await BookingAPI.createBooking({
        roomId,
        seatNumber: seatIndex,
        startMonth,
        durationMonths: duration,
      });
      await BookingAPI.confirmBooking(created.id);
      nav.navigate("MyBookings");
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
        "Booking failed. Please try again.",
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ConfirmScreenHeader />
      <View style={styles.card}>
        <View style={styles.row}>
          <Typography variant="body" color={Colors.TEXT_GRAY}>{"Property"}</Typography>
          <Typography variant="h3">{currentProperty?.title}</Typography>
        </View>

        <View style={styles.row}>
          <Typography variant="body" color={Colors.TEXT_GRAY}>{"Room"}</Typography>
          <Typography variant="h3">{roomName}</Typography>
        </View>

        <View style={styles.row}>
          <Typography variant="body" color={Colors.TEXT_GRAY}>{"Seat"}</Typography>
          <Typography variant="h3">{seatIndex}</Typography>
        </View>

        <View style={{ justifyContent: "space-between" }}>
          <Typography variant="body" color={Colors.TEXT_GRAY}>{"Lease Period"}</Typography>
          <View style={styles.pickerRow}>
            <Picker
              selectedValue={fromDate}
              style={styles.picker}
              mode="dropdown"
              onValueChange={(itemValue) => setFromDate(itemValue)}
            >
              {Years.map((year) =>
                Months.map((month) => (
                  <Picker.Item
                    key={year + "-" + month}
                    label={year + "-" + month}
                    value={year + "-" + month}
                  />
                )),
              )}
            </Picker>
            <Typography variant="h1">{"-"}</Typography>
            <Picker
              selectedValue={toDate}
              style={styles.picker}
              mode="dropdown"
              onValueChange={(itemValue) => setToDate(itemValue)}
            >
              {Years.map((year) =>
                Months.map((month) => (
                  <Picker.Item
                    key={year + "-" + month}
                    label={year + "-" + month}
                    value={year + "-" + month}
                  />
                )),
              )}
            </Picker>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Typography variant="body" color={Colors.TEXT_GRAY}>{"Price Breakdown"}</Typography>
          <Typography variant="body" color={Colors.TEXT_GRAY}>
            {formatNumberIntoCurrency(parseFloat(pricePerSeat + "")) + " x " + duration + " months"}
          </Typography>
        </View>

        <View style={styles.row}>
          <Typography variant="h1">{"Total"}</Typography>
          <Typography variant="h1">{formatNumberIntoCurrency(parseFloat(total))}</Typography>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <RegularButton
        Icon={<Lock color={"white"} />}
        loading={booking}
        disable={duration < 1 || booking}
        onPress={bookNow}
        text={"Pay LKR " + total}
      />
      <Typography variant="caption" style={{ textAlign: "center" }}>
        Full payment is required upfront for the entire
      </Typography>
    </View>
  );
};

export default ConfirmBooking;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    flex: 1,
    gap: 16,
  },
  card: {
    padding: 20,
    elevation: 1,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    gap: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  picker: {
    backgroundColor: "#eee",
    width: "40%",
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.BORDER_GRAY,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    textAlign: "center",
  },
});