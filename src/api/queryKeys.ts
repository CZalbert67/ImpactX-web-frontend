export const queryKeys = {
  profile: ["auth", "profile"] as const,
  plans: ["plans"] as const,
  dashboard: ["dashboard"] as const,

  trips: ["trips"] as const,
  tripsList: ["trips", "list"] as const,
  tripDetail: (tripId: string) => ["trips", "detail", tripId] as const,
  activeTrip: ["trips", "active"] as const,
  tripTelemetry: (tripId: string) => ["trips", "telemetry", tripId] as const,
  tripsSummary: ["analytics", "trips", "summary"] as const,

  vehicles: ["vehicles"] as const,
  vehicle: (publicVehicleId: string) =>
    ["vehicles", publicVehicleId] as const,

  family: ["family-subscriptions"] as const,
  familyCurrent: ["family-subscriptions", "current"] as const,
  familyMembers: ["family-subscriptions", "members"] as const,
  familyInvitations: ["family-subscriptions", "invitations"] as const,

  monitoring: ["monitoring-relationships"] as const,
  monitoringDetail: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId] as const,
  monitoredTrips: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId, "trips"] as const,
  monitoredAlerts: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId, "alerts"] as const,
  monitoredIncidents: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId, "incidents"] as const,
  monitoredRoutes: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId, "routes"] as const,
  monitoredMedicalProfile: (publicRelationshipId: string) =>
    ["monitoring-relationships", publicRelationshipId, "medical"] as const,

  quickMessages: ["quick-messages"] as const,
  quickMessageTemplates: ["quick-messages", "templates"] as const,
  quickMessageHistory: (otherPublicProfileId?: string | null) =>
    ["quick-messages", "history", otherPublicProfileId ?? "all"] as const,
  quickMessageUnreadCount: ["quick-messages", "unread-count"] as const,

  alerts: ["alerts"] as const,
  incidents: ["incidents"] as const,
  incident: (id: string) => ["incidents", id] as const,
  contacts: ["contacts"] as const,
  devices: ["devices"] as const,
  notifications: ["notifications"] as const,
  routesFrequent: ["routes", "frequent"] as const,
  routesHistory: ["routes", "history"] as const,
  fullProfile: ["profile", "full"] as const,
  profilePreferences: ["profile", "preferences"] as const,
  profileDriver: ["profile", "driver"] as const,
  profileMedical: ["profile", "medical"] as const,
  profileOnboarding: ["profile", "onboarding"] as const,
  settings: ["settings"] as const,
  wearables: ["wearables"] as const,
  wearableDiagnostics: ["wearables", "diagnostics"] as const,
} as const;
