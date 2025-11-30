import { BaseClient } from "../base-client";

export const listCorporates = () =>
    BaseClient.post("/v1/corporates/list", { includeProducts: true });
