import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

// Load from Vite env
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9080/api";

function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}

export interface ApiClientOptions {
    handleAuthErrors?: boolean;
}

// -----------------------------------------
// 🔹 ApiError Class
// -----------------------------------------

export class ApiError extends Error {
    response: any;

    constructor(response: any) {
        super(response.description || "API error occurred.");
        this.name = "ApiError";
        this.response = response;
    }
}

export class BaseClient {

    // -----------------------------------------
    // 🔹 Shared error handling
    // -----------------------------------------
    private static handleError(response: Response, options: ApiClientOptions) {
        if (response.status === 401 && options.handleAuthErrors) {
            localStorage.removeItem("deviceId");
            window.location.href = "/login";
            throw new Error("Session expired. Redirecting to login.");
        }
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    // -----------------------------------------
    // 🔹 POST with JSON
    // -----------------------------------------
    static async post<T>(
        endpoint: string,
        payload: any,
        options: ApiClientOptions = { handleAuthErrors: true }
    ): Promise<T> {

        const parser = new UAParser();
        const result = parser.getResult();

        const fullPayload = {
            device: {
                deviceId: getDeviceId(),
                deviceType: result.device.type || "desktop",
                manufacturer: result.device.vendor || "Unknown",
                os: result.os.name || "Unknown",
                osVersion: result.os.version || "Unknown",
                appVersion: "0.0.0",
                ipAddress: "",
                channel: "WEB",
            },
            payload,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(fullPayload),
        });

        if (!response.ok) this.handleError(response, options);

        const json = await response.json();
        if (!json.success) throw new ApiError(json);

        return json.data as T;
    }

    // -----------------------------------------
    // 🔹 GET (No baseUrl override anymore)
    // -----------------------------------------
    static async get<T>(
        endpoint: string,
        options: ApiClientOptions = { handleAuthErrors: true }
    ): Promise<T> {

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) this.handleError(response, options);

        const json = await response.json();

        if (json?.success === false) {
            throw new ApiError(json);
        }

        return (json.data ?? json) as T;
    }

    // -----------------------------------------
    // 🔹 Multipart File Upload
    // -----------------------------------------
    static async upload<T>(
        endpoint: string,
        files: File[],
        options: ApiClientOptions = { handleAuthErrors: true }
    ): Promise<T> {

        const formData = new FormData();
        files.forEach((f) => formData.append("file", f));

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) this.handleError(response, options);

        const json = await response.json();
        if (!json.success) throw new ApiError(json);

        return json.data as T;
    }
    // -----------------------------------------
    // 🔹 POST with FormData
    // -----------------------------------------
    static async postFormData<T>(
        endpoint: string,
        formData: FormData,
        options: ApiClientOptions = { handleAuthErrors: true }
    ): Promise<T> {

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) this.handleError(response, options);

        const json = await response.json();
        if (!json.success) throw new ApiError(json);

        return json.data as T;
    }
}
