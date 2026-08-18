import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import NotificationsHeader from "./components/Header";
import { NotificationsAPI, Notification } from "../../../api/notifications";
import { Colors } from "../../../constant/colors";
import Typography from "../../../components/ui/Typography";
import { CheckCheck } from "lucide-react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSafeAreaInsets } from "react-native-safe-area-context";

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, string> = {
  BOOKING_RECEIVED: "📋",
  BOOKING_CONFIRMED: "✅",
  BOOKING_CANCELLED: "❌",
  BOOKING_EXPIRED: "⏰",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      NotificationsAPI.list()
        .then(setNotifications)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await NotificationsAPI.markRead(id).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await NotificationsAPI.markAllRead().catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NotificationsHeader />

      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Typography variant="caption">
            {unreadCount} unread
          </Typography>
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <CheckCheck size={14} color={Colors.PRIMARY_COLOR} />
            <Typography variant="caption" color={Colors.PRIMARY_COLOR}>
              Mark all read
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text style={styles.hint}>Loading notifications...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.hint}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => {
                if (!item.read) markRead(item.id);
              }}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.icon}>{TYPE_ICONS[item.type] ?? "🔔"}</Text>
              </View>
              <View style={styles.cardRight}>
                <Typography variant="subtitle">{item.message}</Typography>
                {item.property && (
                  <Typography variant="caption" color={Colors.TEXT_GRAY}>
                    {item.property.title}
                  </Typography>
                )}
                <Typography variant="caption" color={Colors.TEXT_GRAY}>
                  {dayjs(item.createdAt).fromNow()}
                </Typography>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 8,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardUnread: {
    backgroundColor: "#FFF7ED",
  },
  cardLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
  cardRight: {
    flex: 1,
    gap: 2,
  },
  hint: {
    textAlign: "center",
    marginTop: 48,
    color: Colors.TEXT_GRAY,
  },
});
