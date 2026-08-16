import { Booking } from "../types/booking";
import { apiClient } from "./apiClient";

export interface CreateBookingInput {
  roomId: string;
  seatNumber: number;
  startMonth: string; // "YYYY-MM"
  durationMonths: number;
}

export const BookingAPI = {
  createBooking: async (input: CreateBookingInput) => {
    const d = await apiClient.post<Booking>("bookings", input);
    return d.data;
  },

  confirmBooking: async (id: string) => {
    const d = await apiClient.post<Booking>(`bookings/${id}/confirm`);
    return d.data;
  },

  myBookings: async () => {
    const d = await apiClient.get<Booking[]>("bookings/my");
    return d.data;
  },
};