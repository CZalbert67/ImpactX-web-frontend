import axios from 'axios';

// Instancia centralizada de Axios para la comunicación con ImpactX Backend API en Azure
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://impactx-api-backend-h0eyf9c4fxd8dsbc.westus-01.azurewebsites.net/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de peticiones: Inyecta el token Bearer JWT almacenado
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas: Manejo global de expiración de sesión (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o token inválido en ImpactX Backend.");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_info');
        }
        return Promise.reject(error);
    }
);

// Métodos auxiliares organizados por controladores del backend (94 Endpoints)
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    recoverPassword: (data) => api.post('/auth/recover-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
    getSessions: () => api.get('/auth/sessions'),
    deleteSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
    deleteAccount: () => api.delete('/auth/account'),
    exportAccount: () => api.get('/auth/account/export')
};

export const userService = {
    getMe: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
    getPreferences: () => api.get('/users/me/preferences'),
    updatePreferences: (data) => api.put('/users/me/preferences', data),
    getDriverProfile: () => api.get('/users/driver-profile'),
    updateDriverProfile: (data) => api.put('/users/driver-profile', data),
    getMedicalProfile: () => api.get('/users/driver-profile/medical'),
    updateMedicalProfile: (data) => api.put('/users/driver-profile/medical', data),
    searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`)
};

export const wearableService = {
    getStatus: () => api.get('/wearable'),
    pair: (data) => api.post('/wearable/pair', data),
    confirmPair: (data) => api.post('/wearable/pair/confirm', data),
    sync: (data) => api.post('/wearable/sync', data),
    calibrate: (data) => api.post('/wearable/calibration', data),
    unlink: () => api.delete('/wearable/unlink'),
    updatePermissions: (data) => api.put('/wearable/permissions', data),
    getDiagnostics: () => api.get('/wearable/sensors/diagnostics'),
    updateBattery: (data) => api.patch('/wearable/battery', data)
};

export const alertService = {
    detectImpact: (data) => api.post('/alertas/detect', data),
    triggerSos: (data) => api.post('/alertas/sos', data),
    confirmOk: (id) => api.post(`/alertas/${id}/confirm-ok`),
    bypassCritical: (id) => api.post(`/alertas/${id}/bypass-critical`),
    retryAlert: (id) => api.post(`/alertas/${id}/retry`),
    getAlert: (id) => api.get(`/alertas/${id}`),
    closeAlert: (id) => api.post(`/alertas/${id}/close`),
    syncOffline: (data) => api.post('/alertas/sync-offline', data)
};

export const monitorService = {
    getMonitors: () => api.get('/monitors'),
    inviteMonitor: (data) => api.post('/monitors/invite', data),
    resendInvite: (id) => api.post(`/monitors/${id}/resend`),
    restoreMonitor: (id) => api.post(`/monitors/${id}/restore`),
    deleteMonitor: (id) => api.delete(`/monitors/${id}`),
    getInviteToken: (token) => api.get(`/monitors/invite/${token}`),
    acceptInviteToken: (token) => api.post(`/monitors/invite/${token}/accept`),
    rejectInviteToken: (token) => api.post(`/monitors/invite/${token}/reject`)
};

export const contactService = {
    getContacts: () => api.get('/contacts'),
    getContact: (id) => api.get(`/contacts/${id}`),
    createContact: (data) => api.post('/contacts', data),
    updateContact: (id, data) => api.put(`/contacts/${id}`, data),
    deleteContact: (id) => api.delete(`/contacts/${id}`),
    makePrimary: (data) => api.patch('/contacts/make-primary', data),
    syncContacts: () => api.get('/contacts/sync')
};

export const subscriptionService = {
    getStatus: () => api.get('/subscription'),
    getHistory: () => api.get('/subscription/history'),
    changePlan: (data) => api.post('/subscription/change-plan', data),
    cancel: () => api.post('/subscription/cancel'),
    getPayments: () => api.get('/subscription/payments'),
    getReceipt: (id) => api.get(`/subscription/payments/${id}/receipt`),
    expireSubscription: () => api.post('/subscription/expire')
};

export const incidentService = {
    getIncidents: () => api.get('/incidentes'),
    getIncident: (id) => api.get(`/incidentes/${id}`),
    markFalseAlarm: (id) => api.patch(`/incidentes/${id}/mark-false-alarm`),
    addNote: (id, data) => api.patch(`/incidentes/${id}/note`, data),
    getMapLocation: (id) => api.get(`/incidentes/${id}/map`),
    exportIncidents: () => api.get('/incidentes/export')
};

export const routeService = {
    getFrequentRoutes: () => api.get('/routes/frequent'),
    createFrequentRoute: (data) => api.post('/routes/frequent', data),
    updateFrequentRoute: (id, data) => api.put(`/routes/frequent/${id}`, data),
    deleteFrequentRoute: (id) => api.delete(`/routes/frequent/${id}`),
    selectTodayRoute: (data) => api.patch('/routes/select-today', data),
    getRouteHistory: () => api.get('/routes/history')
};

export const tripService = {
    startTrip: (data) => api.post('/trips/start', data),
    pauseTrip: (id) => api.post(`/trips/${id}/pause`),
    resumeTrip: (id) => api.post(`/trips/${id}/resume`),
    finishTrip: (id) => api.post(`/trips/${id}/finish`),
    sendTelemetry: (id, data) => api.patch(`/trips/${id}/telemetry`, data),
    getActiveTrip: () => api.get('/trips/active')
};

export const notificationService = {
    getNotifications: () => api.get('/notificaciones'),
    getUnreadCount: () => api.get('/notificaciones/unread-count'),
    markAsRead: (id) => api.patch(`/notificaciones/${id}/read`),
    markAllAsRead: () => api.patch('/notificaciones/read-all'),
    deleteNotification: (id) => api.delete(`/notificaciones/${id}`),
    deleteAllNotifications: () => api.delete('/notificaciones')
};

export const permissionService = {
    getPermissions: () => api.get('/permissions'),
    updateMobilePermissions: (data) => api.put('/permissions/mobile', data),
    updateWebPermissions: (data) => api.put('/permissions/web', data)
};

export const settingService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.put('/settings', data),
    setup2FA: () => api.post('/settings/2fa/setup'),
    enable2FA: (data) => api.post('/settings/2fa/enable', data),
    disable2FA: () => api.delete('/settings/2fa')
};

export const analyticsService = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getIncidentTrends: () => api.get('/analytics/incidents/trend'),
    getTripSummary: () => api.get('/analytics/trips/summary')
};

export const planService = {
    getPlans: () => api.get('/plans')
};

export default api;
