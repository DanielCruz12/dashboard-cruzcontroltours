import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createRental as apiCreateRental,
  listRentals as apiListRentals,
  updateRental as apiUpdateRental,
  type Rental,
  type RentalInput,
} from "@/services/rental-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type RentalsState = {
  items: Rental[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: RentalsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchRentals = createAsyncThunk<
  Rental[],
  void,
  { rejectValue: string }
>("rentals/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListRentals();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createRental = createAsyncThunk<
  Rental,
  RentalInput,
  { rejectValue: string }
>("rentals/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateRental(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateRental = createAsyncThunk<
  Rental,
  { id: string; input: RentalInput },
  { rejectValue: string }
>("rentals/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateRental(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const rentalsSlice = createSlice({
  name: "rentals",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentals.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchRentals.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRentals.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar los despachos.";
      })
      .addCase(createRental.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createRental.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createRental.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el despacho.";
      })
      .addCase(updateRental.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateRental.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateRental.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el despacho.";
      });
  },
});

export const { resetSave } = rentalsSlice.actions;
export default rentalsSlice.reducer;
