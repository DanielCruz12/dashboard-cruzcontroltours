// Slice de customers del panel: lista, crea y borra clientes.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createCustomer as apiCreateCustomer,
  deleteCustomer as apiDeleteCustomer,
  getCustomers as apiListCustomers,
  type Customer,
  type CustomerInput,
} from "@/services/customer-service";
import { toErrorMessage } from "@/lib/api-client";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type CustomersState = {
  items: Customer[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: CustomersState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
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

export const createCustomer = createAsyncThunk<
  Customer,
  CustomerInput,
  { rejectValue: string }
>("customers/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateCustomer(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeCustomer = createAsyncThunk<
  string,
  string,
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
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
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
      .addCase(createCustomer.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el cliente.";
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = customersSlice.actions;
export default customersSlice.reducer;
