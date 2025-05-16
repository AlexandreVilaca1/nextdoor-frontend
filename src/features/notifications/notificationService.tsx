import Cookies from "js-cookie";
import { Notificacao } from "./notificationTypes";

export async function fetchNotifications(): Promise<Notificacao[]> {
  const token = Cookies.get('jwt');

  const response = await fetch('http://localhost:3000/api/notifications', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error fetching notifications');
  }

  console.log(data.message);
  return data.notification; 
}

export async function createNotification(massage: string, taskRealizationId: number): Promise<Notificacao> {
  const token = Cookies.get("jwt");

  const response = await fetch("http://localhost:3000/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      mensagem: massage,
      realizacaoTarefaidRealizacaoTarefa: taskRealizationId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error creating task Task Creation Service');
  }

  console.log(data.message)
  return data.notification
} 

export async function fetchNotificationById(notificationId: number): Promise<Notificacao> {
  const token = Cookies.get("jwt");

  const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error fetching notification");
  }

  console.log(data.message);
  return data.notification;
}
