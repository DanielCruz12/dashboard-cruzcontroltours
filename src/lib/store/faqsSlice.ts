import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createFaq as apiCreateFaq,
  deleteFaq as apiDeleteFaq,
  listFaqs as apiListFaqs,
  updateFaq as apiUpdateFaq,
  type Faq,
  type FaqInput,
} from "@/services/faq-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type FaqsState = {
  items: Faq[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: FaqsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchFaqs = createAsyncThunk<
  Faq[],
  void,
  { rejectValue: string }
>("faqs/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListFaqs();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createFaq = createAsyncThunk<
  Faq,
  FaqInput,
  { rejectValue: string }
>("faqs/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateFaq(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateFaq = createAsyncThunk<
  Faq,
  { id: string; input: FaqInput },
  { rejectValue: string }
>("faqs/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateFaq(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeFaq = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("faqs/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteFaq(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const faqsSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar las preguntas.";
      })
      .addCase(createFaq.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la pregunta.";
      })
      .addCase(updateFaq.pending, (state, action) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar la pregunta.";
      })
      .addCase(removeFaq.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = faqsSlice.actions;
export default faqsSlice.reducer;
