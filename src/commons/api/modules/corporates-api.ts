import { BaseClient } from "../base-client";

export const listCorporates = () =>
    BaseClient.post("/corporates/list", { includeProducts: true });
