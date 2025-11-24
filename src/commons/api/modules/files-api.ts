import { MultipartClient } from "../multipart-client";

export const uploadFile = (file: File) =>
    MultipartClient.upload("/files/upload", [file]);
