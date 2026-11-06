'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationState {
  state: string;
  city: string;
  locality?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isCustom: boolean;
}

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: Partial<LocationState>) => void;
  detectDeviceLocation: () => Promise<void>;
  isDetecting: boolean;
  detectError: string | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const defaultLocation: LocationState = {
  state: 'Maharashtra',
  city: 'Mumbai',
  locality: 'Bandra West',
  pincode: '400050',
  latitude: 19.0596,
  longitude: 72.8295,
  isCustom: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(defaultLocation);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Load saved location from localStorage if available
    try {
      const saved = localStorage.getItem('cielvo_location');
      if (saved) {
        setLocationState(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setLocation = (newLoc: Partial<LocationState>) => {
    setLocationState((prev) => {
      const updated = { ...prev, ...newLoc, isCustom: true };
      try {
        localStorage.setItem('cielvo_location', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const detectDeviceLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // In production, reverse geocode using Google Maps or OpenStreetMap Nominatim
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const detectedCity = addr.city || addr.town || addr.state_district || 'Mumbai';
              const detectedState = addr.state || 'Maharashtra';
              const detectedLocality = addr.suburb || addr.neighbourhood || addr.road || '';
              const detectedPin = addr.postcode || '';

              setLocation({
                state: detectedState,
                city: detectedCity,
                locality: detectedLocality,
                pincode: detectedPin,
                latitude: lat,
                longitude: lng,
              });
            } else {
              setLocation({ latitude: lat, longitude: lng });
            }
          } catch (e) {
            // Fallback: coordinates only
            setLocation({ latitude: lat, longitude: lng });
          } finally {
            setIsDetecting(false);
            setIsModalOpen(false);
            resolve();
          }
        },
        (error) => {
          setIsDetecting(false);
          let message = 'Unable to retrieve location';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied. Please select your city manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setDetectError(message);
          resolve();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        detectDeviceLocation,
        isDetecting,
        detectError,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
