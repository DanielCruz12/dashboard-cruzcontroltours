import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createForm as apiCreateForm,
  deleteForm as apiDeleteForm,
  getForm as apiGetForm,
  listForms as apiListForms,
  listResponses as apiListResponses,
  updateForm as apiUpdateForm,
  type FormInput,
  type FormUpdateInput,
  type ResponsesPayload,
  type ResponsesQuery,
  type ReviewFormDetail,
  type ReviewFormListItem,
} from "@/services/review-form-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type ReviewFormsState = {
  items: ReviewFormListItem[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
  responses: ResponsesPayload | null;
  responsesStatus: RequestStatus;
  responsesError: string | null;
};

const initialState: ReviewFormsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
  responses: null,
  responsesStatus: "idle",
  responsesError: null,
};

export const fetchForms = createAsyncThunk<
  ReviewFormListItem[],
  string | undefined,
  { rejectValue: string }
>("reviewForms/fetchAll", async (tourId, { rejectWithValue }) => {
  try {
    return await apiListForms(tourId);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const fetchFormDetail = createAsyncThunk<
  ReviewFormDetail,
  string,
  { rejectValue: string }
>("reviewForms/fetchOne", async (id, { rejectWithValue }) => {
  try {
    return await apiGetForm(id);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createForm = createAsyncThunk<
  ReviewFormDetail,
  FormInput,
  { rejectValue: string }
>("reviewForms/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreateForm(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateForm = createAsyncThunk<
  ReviewFormDetail,
  { id: string; input: FormUpdateInput },
  { rejectValue: string }
>("reviewForms/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdateForm(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeForm = createAsyncThunk<
  { id: string; deleted: boolean },
  string,
  { rejectValue: string }
>("reviewForms/remove", async (id, { rejectWithValue }) => {
  try {
    const deleted = await apiDeleteForm(id);
    return { id, deleted };
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const fetchResponses = createAsyncThunk<
  ResponsesPayload,
  ResponsesQuery,
  { rejectValue: string }
>("reviewForms/fetchResponses", async (query, { rejectWithValue }) => {
  try {
    return await apiListResponses(query);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const reviewFormsSlice = createSlice({
  name: "reviewForms",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForms.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar los formularios.";
      })
      .addCase(createForm.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createForm.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(createForm.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el formulario.";
      })
      .addCase(updateForm.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updateForm.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(updateForm.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el formulario.";
      })
      .addCase(removeForm.fulfilled, (state, action) => {
        // Borrado real: quitar de la lista. Desactivado: recargar.
        if (action.payload.deleted) {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id,
          );
        } else {
          state.listStatus = "idle";
        }
      })
      .addCase(fetchResponses.pending, (state) => {
        state.responsesStatus = "loading";
        state.responsesError = null;
      })
      .addCase(fetchResponses.fulfilled, (state, action) => {
        state.responsesStatus = "succeeded";
        state.responses = action.payload;
      })
      .addCase(fetchResponses.rejected, (state, action) => {
        state.responsesStatus = "failed";
        state.responsesError =
          action.payload ?? "No se pudieron cargar las respuestas.";
      });
  },
});

export const { resetSave } = reviewFormsSlice.actions;
export default reviewFormsSlice.reducer;
