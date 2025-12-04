import { BaseClient } from "../base-client";

export const validateApplication = (data: any) =>
    BaseClient.post("/v1/applications/batch/validate", data);

export const createApplication = (data: any) =>
    BaseClient.post("/v1/applications/batch/create", data);

export const listApplicationBatches = (status: string | undefined, page: number, size: number) =>
    BaseClient.post("/v1/applications/batch/list", {
        filter: status ? { status } : {},
        page: page + 1,
        size,
    });

export const getBatchDetails = async (batchId: number) => {
    return BaseClient.post<any>("/v1/applications/batch/list", {
        filter: { batchId },
        page: 1,
        size: 1,
    }).then(res => res.content?.[0] || null);
};

export const listApplicationsInBatch = (batchId: number, page: number, size: number) =>
    BaseClient.post("/v1/applications/list", {
        filter: { batchId },
        page: page + 1,
        size,
    });

export const getApplicationDetails = (id: number) =>
    BaseClient.post("/v1/applications/fetch", { applicationId: id });

export const approveOrRejectBatch = (
    batchId: number,
    action: "APPROVE" | "REJECT" | "CANCEL",
    reason: string
) =>
    BaseClient.post("/v1/applications/batch/action", {
        batchId,
        action,
        reason,
    });

