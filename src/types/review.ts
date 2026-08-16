export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  bookingId: string;
  rating: number; // 1-5
  comment: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}