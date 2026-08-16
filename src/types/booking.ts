export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface Booking {
  id: string;
  tenantId: string;
  roomId: string;
  seatNumber: number;
  leaseStart: string;
  leaseEnd: string;
  durationMonths: number;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
  room: {
    id: string;
    roomLabel: string;
    roomType: {
      id: string;
      name: string;
      pricePerMonth: string;
      property: {
        id: string;
        title: string;
        city: string;
        imageUrl: string;
      };
    };
  };
}