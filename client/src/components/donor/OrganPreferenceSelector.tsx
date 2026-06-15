"use client";
import React from "react";

export const ORGAN_OPTIONS = [
  "Kidney",
  "Liver",
  "Cornea",
  "Pancreas",
  "Bone Marrow",
  "Heart",
  "Lung",
] as const;

const ORGAN_ICONS: Record<string, React.ReactNode> = {
  Kidney: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.5 2 6 4.5 6 8c0 5 3 8 6 12 3-4 6-7 6-12 0-3.5-2.5-6-6-6z" />
    </svg>
  ),
  Liver: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.78l8.42 8.42 8.42-8.42a5.4 5.4 0 0 0 0-7.78z" />
    </svg>
  ),
  Cornea: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    </svg>
  ),
  Pancreas: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M12 3v18" />
    </svg>
  ),
  "Bone Marrow": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  Heart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Lung: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 4v16M4 12c0-4.4 2.5-8 5-8v16c-2.5 0-5-3.6-5-8zM20 12c0-4.4-2.5-8-5-8v16c2.5 0 5-3.6 5-8z" />
    </svg>
  ),
};

interface OrganPreferenceSelectorProps {
  selected: string[];
  onChange: (updated: string[]) => void;
  disabled?: boolean;
}

/**
 * Checkbox grid for selecting which organs a donor is willing to donate.
 * Controlled component — caller manages state.
 */
export function OrganPreferenceSelector({ selected, onChange, disabled = false }: OrganPreferenceSelectorProps) {
  const toggle = (organ: string) => {
    if (disabled) return;
    onChange(
      selected.includes(organ)
        ? selected.filter((o) => o !== organ)
        : [...selected, organ]
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ORGAN_OPTIONS.map((organ) => {
        const isSelected = selected.includes(organ);
        return (
          <button
            key={organ}
            type="button"
            disabled={disabled}
            onClick={() => toggle(organ)}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-150 text-sm font-semibold
              ${isSelected
                ? "bg-[#eef4e2] border-[#3b5e2b] text-[#3b5e2b] shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#a5d84a] hover:bg-[#f8fbf4]"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className={`shrink-0 ${isSelected ? "text-[#3b5e2b]" : "text-gray-400"}`}>
              {ORGAN_ICONS[organ]}
            </span>
            <span className="leading-tight">{organ}</span>
            {isSelected && (
              <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
