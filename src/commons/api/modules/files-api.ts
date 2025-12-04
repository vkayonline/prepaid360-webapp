import { BaseClient } from "../base-client";

export const uploadFile = (file: File) =>
    BaseClient.upload("/v1/files/upload", [file]);

export const downloadFile = (fileName: string) =>
    BaseClient.downloadBlob(`/v1/files/download/${fileName}`);
