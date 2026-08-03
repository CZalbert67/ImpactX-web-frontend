import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";
import { monitoringApi } from "@/features/monitoring/api/monitoringApi";
import type {
  CreateMonitoringInvitationInput,
  MonitoringResponseInput,
  UpdateMonitoringPermissionsInput,
} from "@/features/monitoring/types";

export function useMonitoringRelationships() {
  return useQuery({
    queryKey: queryKeys.monitoring,
    queryFn: ({ signal }) => monitoringApi.getAll(signal),
    ...liveQueryOptions(LIVE_QUERY_INTERVAL.relationships),
  });
}

function useInvalidateMonitoring() {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.monitoring }),
      client.invalidateQueries({ queryKey: queryKeys.quickMessages }),
    ]);
  };
}

export function useCreateMonitoringInvitation() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: (input: CreateMonitoringInvitationInput) =>
      monitoringApi.createInvitation(input),
    onSuccess: invalidate,
  });
}

export function useAcceptMonitoringInvitation() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: (input: MonitoringResponseInput) => monitoringApi.accept(input),
    onSuccess: invalidate,
  });
}

export function useRejectMonitoringInvitation() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: (input: MonitoringResponseInput) => monitoringApi.reject(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMonitoringPermissions() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: ({
      publicRelationshipId,
      input,
    }: {
      publicRelationshipId: string;
      input: UpdateMonitoringPermissionsInput;
    }) => monitoringApi.updatePermissions(publicRelationshipId, input),
    onSuccess: invalidate,
  });
}

export function useBlockMonitoringRelationship() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: (publicRelationshipId: string) =>
      monitoringApi.block(publicRelationshipId),
    onSuccess: invalidate,
  });
}

export function useRevokeMonitoringRelationship() {
  const invalidate = useInvalidateMonitoring();
  return useMutation({
    mutationFn: (publicRelationshipId: string) =>
      monitoringApi.revoke(publicRelationshipId),
    onSuccess: invalidate,
  });
}

export function useMonitoredTrips(publicRelationshipId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.monitoredTrips(publicRelationshipId),
    queryFn: ({ signal }) => monitoringApi.getTrips(publicRelationshipId, signal),
    enabled,
  });
}

export function useMonitoredAlerts(publicRelationshipId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.monitoredAlerts(publicRelationshipId),
    queryFn: ({ signal }) => monitoringApi.getAlerts(publicRelationshipId, signal),
    enabled,
  });
}

export function useMonitoredIncidents(publicRelationshipId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.monitoredIncidents(publicRelationshipId),
    queryFn: ({ signal }) => monitoringApi.getIncidents(publicRelationshipId, signal),
    enabled,
  });
}

export function useMonitoredRoutes(publicRelationshipId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.monitoredRoutes(publicRelationshipId),
    queryFn: async ({ signal }) => {
      const [frequent, history] = await Promise.all([
        monitoringApi.getFrequentRoutes(publicRelationshipId, signal),
        monitoringApi.getRouteHistory(publicRelationshipId, signal),
      ]);
      return { frequent, history };
    },
    enabled,
  });
}

export function useMonitoredMedicalProfile(
  publicRelationshipId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.monitoredMedicalProfile(publicRelationshipId),
    queryFn: ({ signal }) =>
      monitoringApi.getMedicalProfile(publicRelationshipId, signal),
    enabled,
  });
}
