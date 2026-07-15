import api from "../../../services/api";

export interface Notification {
  id: string;
  type: string;
  complaint_id: string;
  complaint_number: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
  const res = await api.get("/complaints/notifications/all");
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/complaints/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch("/complaints/notifications/read-all");
  return res.data;
};