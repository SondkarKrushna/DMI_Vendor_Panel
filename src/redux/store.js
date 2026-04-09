import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authapi";
import { profileApi } from "./api/profileApi";
import { offersApi } from "./api/offersApi";
import { servicesApi } from "./api/servicesApi";
import { advertisementsApi } from "./api/advertisementsApi";
import { enrollmentApi } from "./api/enrollmentApi";
import { callNotesApi } from "./api/callNotesApi";
import { punchApi } from "./api/punchApi";
import { invoiceApi } from "./api/invoiceApi";
import { dashboardApi } from "./api/dashboardApi";
import { affiliationApi } from "./api/affiliationApi";

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [offersApi.reducerPath]: offersApi.reducer,
        [servicesApi.reducerPath]: servicesApi.reducer,
        [advertisementsApi.reducerPath]: advertisementsApi.reducer,
        [enrollmentApi.reducerPath]: enrollmentApi.reducer,
        [callNotesApi.reducerPath]: callNotesApi.reducer,
        [punchApi.reducerPath]: punchApi.reducer,
        [invoiceApi.reducerPath]: invoiceApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [affiliationApi.reducerPath]: affiliationApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            profileApi.middleware,
            offersApi.middleware,
            servicesApi.middleware,
            advertisementsApi.middleware,
            enrollmentApi.middleware,
            callNotesApi.middleware,
            punchApi.middleware,
            invoiceApi.middleware,
            dashboardApi.middleware,
            affiliationApi.middleware,
        ),
});