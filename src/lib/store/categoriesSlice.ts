import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  listCategories as apiListCategories,
  updateCategory as apiUpdateCategory,
  type Category,
  type CategoryInput,
} from "@/services/category-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type CategoriesState = {
  items: Category[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: CategoriesState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListCategories();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createCategory = createAsyncThunk<
  Category,
  CategoryInput,
  { rejectValue: string }
>("categories/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateCategory(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: number; input: CategoryInput },
  { rejectValue: string }
>("categories/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateCategory(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("categories/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteCategory(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar las categorías.";
      })
      .addCase(createCategory.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la categoría.";
      })
      .addCase(updateCategory.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la categoría.";
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = categoriesSlice.actions;
export default categoriesSlice.reducer;
