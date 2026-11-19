import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteReview as apiDeleteReview,
  listReviews as apiListReviews,
  type Review,
} from "@/services/review-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type ReviewsState = {
  items: Review[];
  listStatus: RequestStatus;
  listError: string | null;
};

const initialState: ReviewsState = {
  items: [],
  listStatus: "idle",
  listError: null,
};

export const fetchReviews = createAsyncThunk<
  Review[],
  void,
  { rejectValue: string }
>("reviews/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListReviews();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removeReview = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("reviews/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeleteReview(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar las reseñas.";
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default reviewsSlice.reducer;
