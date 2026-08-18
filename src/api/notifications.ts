import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  bookingId: string | null;
  propertyId: string | null;
  createdAt: string;
  booking: {
    id: string;
    seatNumber: number;
    leaseStart: string;
    leaseEnd: string;
  } | null;
  property: {
    id: string;
    title: string;
  } | null;
}

export const NotificationsAPI = {
  list: async () => {
    const d = await apiClient.get<Notification[]>('notifications');
    return d.data;
  },

  unreadCount: async () => {
    const d = await apiClient.get<{ count: number }>('notifications/unread-count');
    return d.data;
  },

  markRead: async (id: string) => {
    const d = await apiClient.patch<Notification>(`notifications/${id}/read`);
    return d.data;
  },

  markAllRead: async () => {
    const d = await apiClient.patch<{ ok: boolean }>('notifications/read-all');
    return d.data;
  },
};
