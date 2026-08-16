import { Review } from "../types/review";
import { apiClient } from "./apiClient";

export const ReviewAPI = {
  list: async (propertyId: string) => {
    const d = await apiClient.get<Review[]>(`reviews/${propertyId}`);
    return d.data;
  },

  my: async (propertyId: string) => {
    const d = await apiClient.get<Review | null>(`reviews/${propertyId}/my`);
    return d.data;
  },

  create: async (
    propertyId: string,
    input: { rating: number; comment?: string | null },
  ) => {
    const d = await apiClient.post<Review>(`reviews/${propertyId}`, input);
    return d.data;
  },
};