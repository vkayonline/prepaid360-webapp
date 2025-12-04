import { BaseClient } from "../base-client";

// --- Types derived from OpenAPI ---

export interface StagingUploadRequest {
    corporateCode: string;
    productCode: string;
    cardType: string;
    embossType: string;
    filePath?: string;
    application?: any; // StagingApplicationDto
    isBulk: boolean;
    isSingle: boolean;
}

export interface StagingDraftResponse {
    draftId: number;
    status: string;
}

export interface StagingStatusResponse {
    status: string;
    totalCount: number;
    validCount: number;
    invalidCount: number;
}

export interface StagingErrorResponse {
    filePath: string;
}

export interface DraftListRequest {
    page: number;
    size: number;
}

export interface StagingBatchResponse {
    draftId: number;
    uploadedBy: number;
    createdAt: string;
    status: string;
    validCount: number;
    invalidCount: number;
    totalCount: number;
}

// --- API Wrappers ---



export const validateDraft = (payload: StagingUploadRequest) => {
    console.log("draft-api: validateDraft called")
    return BaseClient.post("/v1/applications/draft/validate", payload);
}

export const getDraftStatus = (stagingBatchId: number) =>
    BaseClient.post("/v1/applications/draft/validate/status", { stagingBatchId });

export const listDrafts = (page: number, size: number) =>
    BaseClient.post("/v1/applications/draft/list", { page, size });

export const downloadDraftErrors = (stagingBatchId: number) =>
    BaseClient.postBlob("/v1/applications/draft/errors", { stagingBatchId });

export const submitDraft = (stagingBatchId: number) =>
    BaseClient.post("/v1/applications/submit", { stagingBatchId });
