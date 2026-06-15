"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";

export interface LocationValue {
  label: string;
  coordinates: [number, number] | null; // [longitude, latitude]
}

interface LocationPickerProps {
  initialLabel?: string;
  initialCoordinates?: number[];
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
}

/**
 * Two-mode location picker:
 * 1. Auto GPS (uses existing useGeolocation hook)
 * 2. Manual text address input
 *
 * Emits { label, coordinates } via onChange.
 * coordinates is [longitude, latitude] to match MongoDB 2dsphere convention.
 */
export function LocationPicker({ initialLabel = "", initialCoordinates, onChange, disabled = false }: LocationPickerProps) {
  const [mode, setMode] = useState<"manual" | "gps">("manual");
  const [label, setLabel] = useState(initialLabel);
  const [gpsRequested, setGpsRequested] = useState(false);
  const geo = useGeolocation();

  // Seed initial value
  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  // When GPS resolves, push coordinates upstream
  useEffect(() => {
    if (gpsRequested && !geo.loading && geo.lat !== null && geo.lng !== null) {
      const coords: [number, number] = [geo.lng, geo.lat]; // [lng, lat] for MongoDB
      const gpsLabel = label || `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`;
      setLabel(gpsLabel);
      onChange({ label: gpsLabel, coordinates: coords });
    }
  }, [geo.loading, geo.lat, geo.lng, gpsRequested]);

  const handleManualChange = useCallback((value: string) => {
    setLabel(value);
    onChange({
      label: value,
      coordinates: (initialCoordinates && initialCoordinates.length === 2)
        ? [initialCoordinates[0], initialCoordinates[1]]
        : null,
    });
  }, [initialCoordinates, onChange]);

  const requestGPS = useCallback(() => {
    setMode("gps");
    setGpsRequested(true);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("manual")}
          className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-colors ${
            mode === "manual"
              ? "bg-[#eef4e2] border-[#3b5e2b] text-[#3b5e2b]"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          ✏️ Manual
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={requestGPS}
          className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-colors ${
            mode === "gps"
              ? "bg-[#eef4e2] border-[#3b5e2b] text-[#3b5e2b]"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          📍 Use GPS
        </button>
      </div>

      {mode === "gps" && (
        <div className="text-xs text-center py-3 rounded-xl bg-[#f8fbf4] border border-[#d2e4c0]">
          {geo.loading && gpsRequested ? (
            <span className="text-[#3b5e2b] font-semibold animate-pulse">Detecting location…</span>
          ) : geo.error ? (
            <span className="text-red-500 font-semibold">GPS error: {geo.error}. Use manual instead.</span>
          ) : geo.lat !== null ? (
            <span className="text-[#3b5e2b] font-semibold">
              📍 {geo.lat.toFixed(4)}, {geo.lng?.toFixed(4)} — coordinates saved
            </span>
          ) : (
            <span className="text-gray-400">Click &quot;Use GPS&quot; to detect your coordinates.</span>
          )}
        </div>
      )}

      <input
        type="text"
        value={label}
        disabled={disabled}
        onChange={(e) => handleManualChange(e.target.value)}
        placeholder="e.g. Chicago, IL"
        className="w-full bg-neutral-50 border border-gray-200 p-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#3b5e2b] focus:ring-1 focus:ring-[#3b5e2b] transition-all disabled:cursor-not-allowed disabled:opacity-60"
      />

      {initialCoordinates && initialCoordinates.length === 2 && (
        <p className="text-[10px] text-gray-400 font-medium">
          Saved coordinates: [{initialCoordinates[0]?.toFixed(4)}, {initialCoordinates[1]?.toFixed(4)}]
        </p>
      )}
    </div>
  );
}
