import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createBooking as apiCreateBooking,
  deleteBooking as apiDeleteBooking,
  listBookings as apiListBookings,
  updateBooking as apiUpdateBooking,
  type Booking,
  type BookingCreateInput,
  type BookingUpdateInput,
} from "@/services/booking-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type BookingsState = {
  items: Booking[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: BookingsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>("bookings/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListBookings();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createBooking = createAsyncThunk<
  Booking,
  BookingCreateInput,
  { rejectValue: string }
>("bookings/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateBooking(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateBooking = createAsyncThunk<
  Booking,
  { id: string; input: BookingUpdateInput },
  { rejectValue: string }
>("bookings/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateBooking(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeBooking = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("bookings/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteBooking(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar las reservas.";
      })
      .addCase(createBooking.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la reserva.";
      })
      .addCase(updateBooking.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la reserva.";
      })
      .addCase(removeBooking.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = bookingsSlice.actions;
export default bookingsSlice.reducer;
