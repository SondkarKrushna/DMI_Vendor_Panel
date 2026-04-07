import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authapi";
import { profileApi } from "./api/profileApi";
import { offersApi } from "./api/offersApi";


export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [offersApi.reducerPath]: offersApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
        authApi.middleware,
        profileApi.middleware,
        offersApi.middleware,
    ),
});