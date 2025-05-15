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

  return data.notification; 
}

export async function createNotification(massage: string, taskRealizationId: number): Promise<void> {
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

  if (!response.ok) {
    let errorMessage = "Error creating notification.";
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        //Backend envia { "error": "mensagem..." }
        errorMessage = errorData.error;
      }
    } catch (error) {
      console.error("Unable to parse JSON error response:", error);
    }
    throw new Error(errorMessage);
  }
}
