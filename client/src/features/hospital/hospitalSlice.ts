import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HospitalState {
  activeTab: string;
  bloodStockAlert: boolean;
  emergencyCount: number;
}

const initialState: HospitalState = {
  activeTab: 'dashboard',
  bloodStockAlert: false,
  emergencyCount: 0,
};

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setBloodStockAlert(state, action: PayloadAction<boolean>) {
      state.bloodStockAlert = action.payload;
    },
    setEmergencyCount(state, action: PayloadAction<number>) {
      state.emergencyCount = action.payload;
    },
  },
});

export const { setActiveTab, setBloodStockAlert, setEmergencyCount } = hospitalSlice.actions;
export default hospitalSlice.reducer;
