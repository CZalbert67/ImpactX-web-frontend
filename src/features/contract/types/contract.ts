export type ImpactXClient = "web" | "mobile" | "wearable";

export interface ApiRouteContract {
  path: string;
  method: string;
  anonymous: boolean;
  allowedClients: ImpactXClient[];
}

export interface ApiContractSnapshot {
  apiVersion: string;
  contractVersion: string;
  status: "frozen" | string;
  authentication: string;
  openApiDocument: string;
  legacySunsetUtc: string;
  supportedClients: ImpactXClient[];
  canonicalModules: string[];
  legacyModules: string[];
  retentionDays: Record<string, number>;
  routes: ApiRouteContract[];
}

export interface ClientCapabilityContract {
  client: ImpactXClient;
  capabilities: string[];
  contractVersion: string;
}
