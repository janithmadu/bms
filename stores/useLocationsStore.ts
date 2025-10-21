import { Location } from "@/app/admin/locations/page";
import { create } from "zustand";

interface LocationInterface {
  location: Location[];
  loading: boolean;
  locationById: Location | null;
  fetchLocation: (userId: string, userRole: string) => Promise<void>;
  fetchLocationById: (
    userId: string,
    userRole: string,
    locationId: string
  ) => Promise<void>;
}

export const useLocationsStore = create<LocationInterface>((set) => ({
  location: [],
  loading: false,
  locationById: null,

  fetchLocation: async (userId: string, userRole: string) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `/api/locations?userId=${userId}&role=${userRole}`
      );
      const data: Location[] = await response.json();
      set({ location: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch Locations:", error);
      set({ loading: false });
    }
  },

  fetchLocationById: async (
    locationId: string,
    userId: string,
    userRole: string,
    
  ) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `/api/locations/${locationId}?userId=${userId}&role=${userRole}`
      );
      const data: Location = await response.json();

      
      set({ locationById: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch Location by ID:", error);
      set({ loading: false });
    }
  },
}));
