const API_BASE_URL = "http://localhost:8080/api/v1";

export class MultipartClient {
    static async upload<T>(endpoint: string, files: File[]) {
        const formData = new FormData();
        files.forEach((f) => formData.append("file", f));

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        const json = await response.json();
        if (!json.success) throw new Error(json.description || "File upload failed");

        return json.data as T;
    }
}
