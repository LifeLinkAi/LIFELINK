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

const ORGAN_DETAILS: Record<
  string,
  {
    description: string;
    requirements: string[];
    recovery: string;
    certificateNotice: string;
  }
> = {
  Kidney: {
    description: "Kidneys filter waste from blood. Humans can live normally with just one healthy kidney, making living donation common.",
    requirements: [
      "Compatible blood type match with patient",
      "Normal kidney function and structure verified by ultrasound",
      "Absence of chronic kidney disease, severe hypertension, or diabetes"
    ],
    recovery: "Recovery is typically 3-5 days in the hospital, returning to full activity within 2-4 weeks.",
    certificateNotice: "Requires a Nephrology Clearance Letter and Renal Function Panel certificate."
  },
  Liver: {
    description: "A segment of a living donor's liver can be transplanted. The remaining liver and the transplanted segment both regenerate to full size within weeks.",
    requirements: [
      "Compatible liver volume size based on CT scan",
      "Healthy liver enzymes and function tests",
      "No active liver diseases, hepatitis, or heavy alcohol history"
    ],
    recovery: "Recovery is typically 5-7 days in the hospital, returning to normal activities within 4-6 weeks.",
    certificateNotice: "Requires a Hepatology Clearance Certificate and Liver Function Tests (LFT) report."
  },
  Cornea: {
    description: "Cornea transplants restore vision to patients with corneal blindness. Done primarily as a post-mortem (deceased) donation.",
    requirements: [
      "Free of ocular infections or prior corneal surgeries",
      "Clear cornea tissue on evaluation",
      "No active systemic infectious disease at time of harvesting"
    ],
    recovery: "Post-harvesting takes minutes. Recipient recovery is outpatient, taking 2-3 weeks.",
    certificateNotice: "Requires an Ophthalmology Clearance Document."
  },
  Pancreas: {
    description: "A pancreas transplant is usually performed to restore insulin production for patients with severe Type 1 diabetes. Deceased donor scenario only.",
    requirements: [
      "No history of diabetes or pancreatic disease",
      "Healthy blood glucose regulation",
      "Close tissue compatibility match"
    ],
    recovery: "Donor scenario is deceased. Recipient recovery requires 2-4 weeks of hospital care.",
    certificateNotice: "Requires endocrine profiling and pancreatic enzyme certificate."
  },
  "Bone Marrow": {
    description: "Bone marrow contains stem cells that produce blood cells. Living donors undergo marrow aspiration or peripheral stem cell donation.",
    requirements: [
      "Extremely close HLA (tissue typing) compatibility",
      "Overall robust physical health",
      "No history of leukemia, lymphoma, or auto-immune blood disorders"
    ],
    recovery: "Marrow donor recovery is 2-7 days; peripheral blood donor recovery is 1-2 days.",
    certificateNotice: "Requires an HLA Tissue Typing report and Hematology Clearance Certificate."
  },
  Heart: {
    description: "A critical life-saving deceased donation. The donor's heart is matched based on size, weight, blood compatibility, and tissue typing.",
    requirements: [
      "Normal cardiac function verified by echocardiogram",
      "No history of ischemic heart disease or heart failure",
      "Under 55-60 years of age generally preferred"
    ],
    recovery: "Deceased donation only. Recipient recovery is 4-8 weeks.",
    certificateNotice: "Requires a Cardiologist Evaluation Report and Echocardiogram (ECG) certificate."
  },
  Lung: {
    description: "Deceased donation of lungs or rarely a living lobar donation. Lungs must match chest cavity size and blood compatibility.",
    requirements: [
      "Clear chest X-rays and high oxygenation capacity",
      "No history of chronic asthma, COPD, or heavy smoking",
      "Correct size matching to recipient's chest cavity"
    ],
    recovery: "Deceased donor. Recipient recovery is 6-12 weeks in specialized rehab.",
    certificateNotice: "Requires Pulmonologist Clearance and Chest CT Scan report."
  }
};

interface OrganPreferenceSelectorProps {
  selected: string[];
  onChange: (updated: string[]) => void;
  disabled?: boolean;
  disabledOrgans?: string[];
}

/**
 * Checkbox/Radio grid for selecting which organ a donor is willing to donate.
 * Enforces single-organ selection (radio button behavior).
 * Displays clinical details and prerequisites for the selected organ in a dropdown card.
 */
export function OrganPreferenceSelector({ selected, onChange, disabled = false, disabledOrgans = [] }: OrganPreferenceSelectorProps) {
  const toggle = (organ: string) => {
    if (disabled || disabledOrgans.includes(organ)) return;
    // Enforce single-organ selection: if already selected, deselect it; otherwise, select only this one.
    onChange(selected.includes(organ) ? [] : [organ]);
  };

  const selectedOrgan = selected[0];
  const details = selectedOrgan ? ORGAN_DETAILS[selectedOrgan] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ORGAN_OPTIONS.map((organ) => {
          const isSelected = selected.includes(organ);
          const isDonated = disabledOrgans.includes(organ);
          return (
            <button
              key={organ}
              type="button"
              disabled={disabled || isDonated}
              onClick={() => toggle(organ)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-150 text-sm font-semibold
                ${isSelected
                  ? "bg-[#eef4e2] border-[#3b5e2b] text-[#3b5e2b] shadow-sm"
                  : isDonated
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#a5d84a] hover:bg-[#f8fbf4]"
                }
                ${(disabled || isDonated) ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`shrink-0 ${isSelected ? "text-[#3b5e2b]" : isDonated ? "text-slate-300" : "text-gray-400"}`}>
                {ORGAN_ICONS[organ]}
              </span>
              <span className="leading-tight">{organ}</span>
              {isDonated && (
                <span className="ml-auto text-[8px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                  Donated
                </span>
              )}
              {isSelected && (
                <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Organ Clinical Details Dropdown/Card */}
      {details && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mt-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eef4e2] border border-[#d2e4c0] flex items-center justify-center text-[#3b5e2b] shrink-0 mt-0.5 shadow-sm">
              {ORGAN_ICONS[selectedOrgan]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-950 flex items-center gap-2 flex-wrap">
                <span>{selectedOrgan} Donation Guidelines</span>
                <span className="bg-[#eef4e2] text-[#3b5e2b] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#d2e4c0]">
                  Required Details
                </span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mt-2">{details.description}</p>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Medical Prerequisites</h5>
                  <ul className="space-y-1.5">
                    {details.requirements.map((req, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2 leading-normal">
                        <span className="text-[#5b8a3e] font-black mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                  <div>
                    <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Expected Recovery</h5>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">{details.recovery}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Supplementary Certificates</h5>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold text-[#3b5e2b]">{details.certificateNotice}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
