import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createProtocol as apiCreateProtocol,
  deleteProtocol as apiDeleteProtocol,
  listProtocols as apiListProtocols,
  updateProtocol as apiUpdateProtocol,
  type Protocol,
  type ProtocolInput,
} from "@/services/protocol-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type ProtocolsState = {
  items: Protocol[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: ProtocolsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchProtocols = createAsyncThunk<
  Protocol[],
  void,
  { rejectValue: string }
>("protocols/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListProtocols();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createProtocol = createAsyncThunk<
  Protocol,
  ProtocolInput,
  { rejectValue: string }
>("protocols/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateProtocol(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateProtocol = createAsyncThunk<
  Protocol,
  { id: string; input: ProtocolInput },
  { rejectValue: string }
>("protocols/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateProtocol(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeProtocol = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("protocols/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteProtocol(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const protocolsSlice = createSlice({
  name: "protocols",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProtocols.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchProtocols.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProtocols.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar los protocolos.";
      })
      .addCase(createProtocol.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createProtocol.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createProtocol.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el protocolo.";
      })
      .addCase(updateProtocol.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateProtocol.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateProtocol.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el protocolo.";
      })
      .addCase(removeProtocol.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = protocolsSlice.actions;
export default protocolsSlice.reducer;
