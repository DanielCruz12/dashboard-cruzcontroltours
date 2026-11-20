import { configureStore } from "@reduxjs/toolkit";
import bookingsReducer from "./bookingsSlice";
import categoriesReducer from "./categoriesSlice";
import customersReducer from "./customersSlice";
import faqsReducer from "./faqsSlice";
import protocolsReducer from "./protocolsSlice";
import reviewsReducer from "./reviewsSlice";
import toursReducer from "./toursSlice";
import usersReducer from "./usersSlice";

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    categories: categoriesReducer,
    customers: customersReducer,
    faqs: faqsReducer,
    protocols: protocolsReducer,
    reviews: reviewsReducer,
    tours: toursReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
