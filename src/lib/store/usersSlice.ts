import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  listUsers as apiListUsers,
  updateUser as apiUpdateUser,
  type PanelUser,
  type PanelUserInput,
} from "@/services/user-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type UsersState = {
  items: PanelUser[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: UsersState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchUsers = createAsyncThunk<
  PanelUser[],
  void,
  { rejectValue: string }
>("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListUsers();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createUser = createAsyncThunk<
  PanelUser,
  PanelUserInput,
  { rejectValue: string }
>("users/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateUser(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateUser = createAsyncThunk<
  PanelUser,
  { id: string; input: PanelUserInput },
  { rejectValue: string }
>("users/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateUser(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteUser(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar los usuarios.";
      })
      .addCase(createUser.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el usuario.";
      })
      .addCase(updateUser.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el usuario.";
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = usersSlice.actions;
export default usersSlice.reducer;
