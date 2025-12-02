import { BaseClient } from "../base-client";

export const validateApplication = (data: any) =>
    BaseClient.post("/v1/application/batch/validate", data);

export const createApplication = (data: any) =>
    BaseClient.post("/v1/application/batch/create", data);

export const listApplicationBatches = (status: string, page: number, size: number) =>
    BaseClient.post("/v1/application/batch/list", {
        filter: { status },
        page: page + 1,
        size,
    });

export const getBatchDetails = async (batchId: number) => {
    const response = await listApplicationBatches("ALL", 0, 1); // We need to filter by batchId, but the list API takes status. 
    // Wait, the listApplicationBatches function takes status, page, size. 
    // The implementation in line 10 uses `filter: { status }`.
    // I need to check if the backend supports filtering by batchId on this endpoint or if I need to use a different approach.
    // The plan said: "Calls /v1/application/batch/list with filter: { batchId }".
    // But the existing `listApplicationBatches` function hardcodes `filter: { status }`.
    // I should create a new function that allows passing a custom filter or specifically batchId.
    return BaseClient.post("/v1/application/batch/list", {
        filter: { batchId },
        page: 1,
        size: 1,
    }).then(res => res.content?.[0] || null);
};

export const listApplicationsInBatch = (batchId: number, page: number, size: number) =>
    BaseClient.post("/v1/application/list", {
        filter: { batchId },
        page: page + 1,
        size,
    });

export const getApplicationDetails = (id: number) =>
    BaseClient.post("/v1/application/fetch", { applicationId: id });

export const approveOrRejectBatch = (
    batchId: number,
    action: "APPROVE" | "REJECT" | "CANCEL",
    reason: string
) =>
    BaseClient.post("/v1/application/batch/action", {
        batchId,
        action,
        reason,
    });

