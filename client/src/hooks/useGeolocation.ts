'use client';
import { useState, useEffect } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({
    lat: null, lng: null, error: null, loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo((g) => ({ ...g, error: 'Not supported', loading: false }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setGeo({ lat: coords.latitude, lng: coords.longitude, error: null, loading: false }),
      (err) =>
        setGeo((g) => ({ ...g, error: err.message, loading: false }))
    );
  }, []);

  return geo;
}
