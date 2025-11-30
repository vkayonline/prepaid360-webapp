import { BaseClient } from "../base-client";

export const checkAuthOptions = (email: string) =>
    BaseClient.post("/v1/auth/options", { email });

export const login = (email: string, password: string) =>
    BaseClient.post("/v1/auth/login", { email, password });

export const logout = () =>
    BaseClient.post("/v1/auth/logout", {});

export const getMe = () =>
    BaseClient.post("/v1/auth/me", {}, { handleAuthErrors: false });

export const refreshSession = () =>
    BaseClient.post("/v1/auth/refresh", {});
