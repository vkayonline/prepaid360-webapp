import { BaseClient } from "../base-client";

export const checkHealth = () =>
  BaseClient.get("/actuator/health", undefined, "/pp/api");
