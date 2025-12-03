export interface ApiError {
    field: string | null;
    message: string;
    reasonCode: string;
}

export interface BaseApiResponse<T = any> {
    success: boolean;
    rc: string;
    code: string;
    title: string;
    description: string;
    data: T;
    errors?: ApiError[];
}

export interface ErrorMapping {
    fieldErrors: Record<string, string>;
    pageError: { title: string; description: string; code: string } | null;
}

export function mapApiErrors(error: any): ErrorMapping {
    const fieldErrors: Record<string, string> = {};
    let pageError: { title: string; description: string; code: string } | null = null;

    // Handle ApiError (which has a response property)
    const response = error?.response || error;

    if (response?.errors && Array.isArray(response.errors)) {
        response.errors.forEach((err: ApiError) => {
            if (err.field) {
                fieldErrors[err.field] = err.message;
            } else {
                // If multiple page-level errors exist, we take the first one or concatenate
                if (!pageError) {
                    pageError = {
                        title: response.title || "Error",
                        description: err.message,
                        code: err.reasonCode || response.code
                    };
                }
            }
        });
    }

    // If no specific errors array but success is false
    if (!response.success && !pageError && Object.keys(fieldErrors).length === 0) {
        pageError = {
            title: response.title || "Error",
            description: response.description || error.message || "An unknown error occurred.",
            code: response.code || "UNKNOWN"
        };
    }

    return { fieldErrors, pageError };
}
