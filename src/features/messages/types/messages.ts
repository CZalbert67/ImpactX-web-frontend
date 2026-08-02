export interface QuickMessageTemplate {
  publicTemplateId: string;
  text: string;
  sortOrder: number;
  isSystem: boolean;
}

export interface QuickMessage {
  publicMessageId: string;
  senderPublicProfileId: string;
  senderUsername: string;
  recipientPublicProfileId: string;
  recipientUsername: string;
  publicRelationshipId: string;
  publicTemplateId: string;
  text: string;
  routePublicId: string | null;
  incidentPublicId: string | null;
  sentAtUtc: string;
  isRead: boolean;
  readAtUtc: string | null;
}

export interface UpsertQuickMessageTemplateInput {
  text: string;
  sortOrder: number;
}

export interface SendQuickMessageInput {
  recipientPublicProfileId: string;
  publicTemplateId: string;
  routePublicId?: string;
  incidentPublicId?: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
