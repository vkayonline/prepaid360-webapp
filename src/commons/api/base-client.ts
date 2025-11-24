import { v4 as uuidv4 } from "uuid";
import UAParser from "ua-parser-js";

const API_BASE_URL = "http://localhost:8080/api/v1";

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

export class BaseClient {
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
                browser: result.browser.name || "Unknown",
                browserVersion: result.browser.version || "Unknown",
            },
            payload,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(fullPayload),
        });

        if (!response.ok) {
            if (response.status === 401 && options.handleAuthErrors) {
                localStorage.removeItem("deviceId");
                window.location.href = "/login";
                throw new Error("Session expired. Redirecting to login.");
            }
            throw new Error(`HTTP Error: ${response.statusText}`);
        }

        const json = await response.json();

        if (!json.success) {
            throw new Error(json.description || "API error occurred.");
        }

        return json.data as T;
    }
}
