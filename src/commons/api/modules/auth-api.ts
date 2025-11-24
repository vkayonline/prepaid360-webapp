import { BaseClient } from "../base-client";

export const checkAuthOptions = (email: string) =>
    BaseClient.post("/auth/options", { email });

export const login = (email: string, password: string) =>
    BaseClient.post("/auth/login", { email, password });

export const logout = () =>
    BaseClient.post("/auth/logout", {});

export const getMe = () =>
    BaseClient.post("/auth/me", {}, { handleAuthErrors: false });
