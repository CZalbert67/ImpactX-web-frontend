import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import {
  alertsApi,
  contactsApi,
  devicesApi,
  incidentsApi,
  notificationsApi,
  profileApi,
  routesApi,
  settingsApi,
  wearablesApi,
} from "@/features/platform/api";
import type {
  ContactInput,
  ContactUpdateInput,
  DeviceRegistrationInput,
  DriverProfile,
  IncidentFilters,
  MedicalProfile,
  Onboarding,
  RouteInput,
  SettingsData,
  UserPreferences,
} from "@/features/platform/types";

function useRefresh(keys: readonly (readonly unknown[])[]) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: ({ signal }) => alertsApi.getAll(signal) });
}

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.incidents, filters] as const,
    queryFn: ({ signal }) => incidentsApi.getAll(filters, signal),
  });
}

export function useIncident(id: string | null) {
  return useQuery({
    queryKey: queryKeys.incident(id ?? "none"),
    queryFn: () => incidentsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useMarkFalseAlarm() {
  const refresh = useRefresh([queryKeys.incidents]);
  return useMutation({
    mutationFn: ({ id, nota }: { id: string; nota?: string }) => incidentsApi.markFalseAlarm(id, nota),
    onSuccess: refresh,
  });
}

export function useUpdateIncidentNote() {
  const refresh = useRefresh([queryKeys.incidents]);
  return useMutation({
    mutationFn: ({ id, nota }: { id: string; nota: string }) => incidentsApi.updateNote(id, nota),
    onSuccess: refresh,
  });
}

export function useContacts() {
  return useQuery({ queryKey: queryKeys.contacts, queryFn: ({ signal }) => contactsApi.getAll(signal) });
}

export function useCreateContact() {
  const refresh = useRefresh([queryKeys.contacts]);
  return useMutation({ mutationFn: (input: ContactInput) => contactsApi.create(input), onSuccess: refresh });
}

export function useUpdateContact() {
  const refresh = useRefresh([queryKeys.contacts]);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactUpdateInput }) => contactsApi.update(id, input),
    onSuccess: refresh,
  });
}

export function useDeleteContact() {
  const refresh = useRefresh([queryKeys.contacts]);
  return useMutation({ mutationFn: (id: string) => contactsApi.remove(id), onSuccess: refresh });
}

export function useMakePrimaryContact() {
  const refresh = useRefresh([queryKeys.contacts]);
  return useMutation({ mutationFn: (id: string) => contactsApi.makePrimary(id), onSuccess: refresh });
}

export function useDevices() {
  return useQuery({ queryKey: queryKeys.devices, queryFn: ({ signal }) => devicesApi.getAll(signal) });
}

export function useRegisterDevice() {
  const refresh = useRefresh([queryKeys.devices]);
  return useMutation({ mutationFn: (input: DeviceRegistrationInput) => devicesApi.register(input), onSuccess: refresh });
}

export function useDeleteDevice() {
  const refresh = useRefresh([queryKeys.devices]);
  return useMutation({ mutationFn: (id: string) => devicesApi.remove(id), onSuccess: refresh });
}

export function useDeleteAllDevices() {
  const refresh = useRefresh([queryKeys.devices]);
  return useMutation({ mutationFn: () => devicesApi.removeAll(), onSuccess: refresh });
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: ({ signal }) => notificationsApi.getAll(signal) });
}

export function useToggleNotificationRead() {
  const refresh = useRefresh([queryKeys.notifications]);
  return useMutation({
    mutationFn: ({ id, leida }: { id: string; leida: boolean }) => notificationsApi.toggleRead(id, leida),
    onSuccess: refresh,
  });
}

export function useReadAllNotifications() {
  const refresh = useRefresh([queryKeys.notifications]);
  return useMutation({ mutationFn: () => notificationsApi.readAll(), onSuccess: refresh });
}

export function useDeleteNotification() {
  const refresh = useRefresh([queryKeys.notifications]);
  return useMutation({ mutationFn: (id: string) => notificationsApi.remove(id), onSuccess: refresh });
}

export function useDeleteAllNotifications() {
  const refresh = useRefresh([queryKeys.notifications]);
  return useMutation({ mutationFn: () => notificationsApi.removeAll(), onSuccess: refresh });
}

export function useFrequentRoutes() {
  return useQuery({ queryKey: queryKeys.routesFrequent, queryFn: ({ signal }) => routesApi.getFrequent(signal) });
}

export function useRouteHistory() {
  return useQuery({ queryKey: queryKeys.routesHistory, queryFn: ({ signal }) => routesApi.getHistory(signal) });
}

function useRefreshRoutes() {
  return useRefresh([queryKeys.routesFrequent, queryKeys.routesHistory]);
}

export function useCreateRoute() {
  const refresh = useRefreshRoutes();
  return useMutation({ mutationFn: (input: RouteInput) => routesApi.create(input), onSuccess: refresh });
}

export function useUpdateRoute() {
  const refresh = useRefreshRoutes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RouteInput> }) => routesApi.update(id, input),
    onSuccess: refresh,
  });
}

export function useDeleteRoute() {
  const refresh = useRefreshRoutes();
  return useMutation({ mutationFn: (id: string) => routesApi.remove(id), onSuccess: refresh });
}

export function useSelectRouteToday() {
  const refresh = useRefreshRoutes();
  return useMutation({ mutationFn: (id: string) => routesApi.selectToday(id), onSuccess: refresh });
}

export function useFullProfile() {
  return useQuery({ queryKey: queryKeys.fullProfile, queryFn: ({ signal }) => profileApi.get(signal) });
}

function useRefreshProfile() {
  return useRefresh([
    queryKeys.fullProfile,
    queryKeys.profile,
    queryKeys.profilePreferences,
    queryKeys.profileDriver,
    queryKeys.profileMedical,
    queryKeys.profileOnboarding,
  ]);
}

export function useUpdateProfile() {
  const refresh = useRefreshProfile();
  return useMutation({
    mutationFn: (input: { nombre?: string; telefono?: string }) => profileApi.update(input),
    onSuccess: refresh,
  });
}

export function useUpdateUsername() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (username: string) => profileApi.updateUsername(username), onSuccess: refresh });
}

export function useProfilePreferences() {
  return useQuery({ queryKey: queryKeys.profilePreferences, queryFn: ({ signal }) => profileApi.getPreferences(signal) });
}

export function useUpdatePreferences() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (input: Partial<UserPreferences>) => profileApi.updatePreferences(input), onSuccess: refresh });
}

export function useDriverProfile() {
  return useQuery({ queryKey: queryKeys.profileDriver, queryFn: ({ signal }) => profileApi.getDriver(signal) });
}

export function useUpdateDriverProfile() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (input: Partial<DriverProfile>) => profileApi.updateDriver(input), onSuccess: refresh });
}

export function useMedicalProfile() {
  return useQuery({ queryKey: queryKeys.profileMedical, queryFn: ({ signal }) => profileApi.getMedical(signal) });
}

export function useUpdateMedicalProfile() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (input: Partial<MedicalProfile>) => profileApi.updateMedical(input), onSuccess: refresh });
}

export function useOnboarding() {
  return useQuery({ queryKey: queryKeys.profileOnboarding, queryFn: ({ signal }) => profileApi.getOnboarding(signal) });
}

export function useUpdateOnboarding() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (input: Partial<Onboarding>) => profileApi.updateOnboarding(input), onSuccess: refresh });
}

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings, queryFn: ({ signal }) => settingsApi.get(signal) });
}

export function useUpdateSettings() {
  const refresh = useRefresh([queryKeys.settings, queryKeys.profilePreferences]);
  return useMutation({ mutationFn: (input: Partial<SettingsData>) => settingsApi.update(input), onSuccess: refresh });
}

export function useSetup2Fa() {
  return useMutation({ mutationFn: () => settingsApi.setup2Fa() });
}

export function useEnable2Fa() {
  const refresh = useRefresh([queryKeys.settings, queryKeys.fullProfile]);
  return useMutation({ mutationFn: (code: string) => settingsApi.enable2Fa(code), onSuccess: refresh });
}

export function useDisable2Fa() {
  const refresh = useRefresh([queryKeys.settings, queryKeys.fullProfile]);
  return useMutation({ mutationFn: (code: string) => settingsApi.disable2Fa(code), onSuccess: refresh });
}

export function useWearables() {
  return useQuery({ queryKey: queryKeys.wearables, queryFn: ({ signal }) => wearablesApi.getAll(signal) });
}

export function useWearableDiagnostics() {
  return useQuery({ queryKey: queryKeys.wearableDiagnostics, queryFn: ({ signal }) => wearablesApi.getDiagnostics(signal) });
}
