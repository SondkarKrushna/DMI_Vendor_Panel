import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,

    endpoints: (builder) => ({
        loginVendor: builder.mutation({
            query: (data) => ({
                url: "/api/auth/login",
                method: "POST",
                body: data,
            }),
        }),
        sendOtp: builder.mutation({
            query: (data) => ({
                url: "/api/auth/send-otp",
                method: "POST",
                body: data,
            }),
        }),
        verifyOtp: builder.mutation({
            query: (data) => ({
                url: "/api/auth/verify-otp",
                method: "POST",
                body: data,
            }),
        }),
        registerVendor: builder.mutation({
            query: (data) => ({
                url: "/api/auth/register",
                method: "POST",
                body: data,
            }),
        }),
        logoutVendor: builder.mutation({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const { useLoginVendorMutation, useRegisterVendorMutation, useLogoutVendorMutation, useSendOtpMutation, useVerifyOtpMutation } = authApi;