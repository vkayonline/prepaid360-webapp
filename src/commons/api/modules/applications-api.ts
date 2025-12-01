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

