import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createPost as apiCreatePost,
  deletePost as apiDeletePost,
  listPosts as apiListPosts,
  updatePost as apiUpdatePost,
  type Post,
  type PostInput,
} from "@/services/post-service";
import { toErrorMessage } from "@/lib/api-client";
import type { RequestStatus } from "./customersSlice";

export type PostsState = {
  items: Post[];
  listStatus: RequestStatus;
  listError: string | null;
  saveStatus: RequestStatus;
  saveError: string | null;
};

const initialState: PostsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  saveStatus: "idle",
  saveError: null,
};

export const fetchPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiListPosts();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createPost = createAsyncThunk<
  Post,
  PostInput,
  { rejectValue: string }
>("posts/create", async (input, { rejectWithValue }) => {
  try {
    return await apiCreatePost(input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updatePost = createAsyncThunk<
  Post,
  { id: string; input: PostInput },
  { rejectValue: string }
>("posts/update", async ({ id, input }, { rejectWithValue }) => {
  try {
    return await apiUpdatePost(id, input);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const removePost = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("posts/remove", async (id, { rejectWithValue }) => {
  try {
    await apiDeletePost(id);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetSave(state) {
      state.saveStatus = "idle";
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "No se pudieron cargar los artículos.";
      })
      .addCase(createPost.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el artículo.";
      })
      .addCase(updatePost.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError =
          action.payload ?? "No se pudo guardar el artículo.";
      })
      .addCase(removePost.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { resetSave } = postsSlice.actions;
export default postsSlice.reducer;
