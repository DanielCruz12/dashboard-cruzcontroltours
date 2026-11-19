// Slice de customers del panel: lista y borra mensajes de contacto.
// (Los clientes se crean desde el formulario del front, no aquí.)
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteCustomer as apiDeleteCustomer,
  getCustomers as apiListCustomers,
  type Customer,
} from "@/services/customer-service";
import { toErrorMessage } from "@/lib/api-client";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type CustomersState = {
  items: Customer[];
  listStatus: RequestStatus;
  listError: string | null;
};

const initialState: CustomersState = {
  items: [],
  listStatus: "idle",
  listError: null,
};

export const fetchCustomers = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>("customers/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListCustomers();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeCustomer = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("customers/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteCustomer(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload ?? "No se pudieron cargar los clientes.";
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default customersSlice.reducer;
