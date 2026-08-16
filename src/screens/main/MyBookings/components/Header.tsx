import { View, StyleSheet } from "react-native";
import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "../../../../constant/colors";
import RoundButton from "../../../../components/ui/RoundButton";
import Typography from "../../../../components/ui/Typography";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MyBookingsHeader = () => {
  const nav: any = useNavigation();
  const gap = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: gap.top }]}>
      <RoundButton
        Icon={<ArrowLeft color={Colors.SECONDARY_COLOR} size={20} />}
        onPress={() => nav.goBack()}
      />
      <View style={styles.titleWrap}>
        <Typography variant="h2">{"My bookings"}</Typography>
      </View>
    </View>
  );
};

export default MyBookingsHeader;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  titleWrap: {
    flex: 1,
    justifyContent: "center",
  },
});