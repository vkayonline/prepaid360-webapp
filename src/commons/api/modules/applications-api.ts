import { BaseClient } from "../base-client";

// Each API becomes a named export
export const validateApplication = (data: any) =>
    BaseClient.post("/application/batch/validate", data);

export const createApplication = (data: any) =>
    BaseClient.post("/application/batch/create", data);

export const listApplicationBatches = (status: string, page: number, size: number) =>
    BaseClient.post("/application/batch/list", {
        filter: { status },
        page: page + 1,
        size,
    });

export const listApplicationsInBatch = (batchId: number, page: number, size: number) =>
    BaseClient.post("/application/list", {
        filter: { batchId },
        page: page + 1,
        size,
    });

export const getApplicationDetails = (id: number) =>
    BaseClient.post("/application/list", { applicationId: id });

export const approveOrRejectBatch = (
    batchId: number,
    action: "APPROVE" | "REJECT",
    reason: string
) =>
    BaseClient.post("/application/batch/action", {
        batchId,
        action,
        reason,
    });

