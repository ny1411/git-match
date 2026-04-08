import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getUserLocation,
  saveUserLocation,
  type UserGeolocation,
} from '../services/location.service';

interface UseDashboardLocationOptions {
  authLoading: boolean;
  userId?: string;
}

const formatLocationLabel = (location: UserGeolocation | null) =>
  [location?.city, location?.country].filter(Boolean).join(', ');

export const useDashboardLocation = ({ authLoading, userId }: UseDashboardLocationOptions) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<UserGeolocation | null>(null);
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  const openLocationModal = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
  }, []);

  const saveLocation = useCallback(
    async (newLocation: UserGeolocation) => {
      setCurrentLocation(newLocation);
      setIsLocationLoaded(true);

      try {
        if (!userId) {
          throw new Error('User not authenticated.');
        }

        await saveUserLocation(userId, newLocation);
      } catch (error) {
        console.error('Failed to save location:', error);
      } finally {
        setIsLocationModalOpen(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setIsLocationLoaded(true);
      return;
    }

    const loadLocation = async () => {
      try {
        const userLocation = await getUserLocation(userId);
        setCurrentLocation(userLocation);
      } catch (error) {
        console.error('Failed to load location:', error);
      } finally {
        setIsLocationLoaded(true);
      }
    };

    void loadLocation();
  }, [authLoading, userId]);

  const locationLabel = useMemo(
    () => formatLocationLabel(currentLocation) || 'Set location',
    [currentLocation]
  );

  return {
    isLocationModalOpen,
    currentLocation,
    isLocationLoaded,
    locationLabel,
    openLocationModal,
    closeLocationModal,
    saveLocation,
  };
};
