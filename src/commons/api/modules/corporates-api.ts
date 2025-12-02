import { BaseClient } from "../base-client";

export const listCorporates = () =>
    BaseClient.post("/v1/corporates/list", { includeProducts: true });

export const getCorporateBalance = (corporateId: number) =>
    BaseClient.post("/v1/corporates/balance", { corporateId });

export const listCorporateProducts = (corporateId: number) =>
    BaseClient.post("/v1/corporates/products/list", { corporateId });
