import { BaseClient } from "../base-client";

export const uploadStagingFile = (data: any) =>
    BaseClient.post("/v1/applications/upload", data);

export const getStagingStatus = (stagingBatchId: string) =>
    BaseClient.post("/v1/applications/status", { stagingBatchId });

export const downloadStagingErrors = (stagingBatchId: string) =>
    BaseClient.post("/v1/applications/errors", { stagingBatchId });

export const submitStagingBatch = (stagingBatchId: string) =>
    BaseClient.post("/v1/applications/submit", { stagingBatchId });

export const validateStagingBatch = (stagingBatchId: string) =>
    BaseClient.post("/v1/applications/validate", { stagingBatchId });
