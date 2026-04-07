import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authapi";
import { profileApi } from "./api/profileApi";
import { offersApi } from "./api/offersApi";
import { advertisementsApi } from "./api/advertisementsApi";
import { callNotesApi } from "./api/callNotesApi";


export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [offersApi.reducerPath]: offersApi.reducer,
        [advertisementsApi.reducerPath]: advertisementsApi.reducer,
        [callNotesApi.reducerPath]: callNotesApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            profileApi.middleware,
            offersApi.middleware,
            advertisementsApi.middleware,
            callNotesApi.middleware,
        ),
});