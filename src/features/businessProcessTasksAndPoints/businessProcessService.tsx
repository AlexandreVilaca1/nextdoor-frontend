import { API_URL } from "../../config/api";
import Cookies from "js-cookie";

export async function aceptTaskRequest(
  taskRealizationId: number,
  taskCreationId: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(`${API_URL}/api/businessProcesses/validateTask`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      taskRealizationId,
      taskCreationId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error validating task");
  }
  console.log(data);
  return data.validation;
}

export async function rejectTaskRequest(
  taskRealizationId: number,
  taskCreationId: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(`${API_URL}/api/businessProcesses/rejectTask`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      taskRealizationId,
      taskCreationId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error rejecting task");
  }
  console.log(data);
  return data;
}

export async function collectPointsAbandonedTaskRequest(
  taskRealizationId: number,
  taskCreationId: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(`${API_URL}/api/businessProcesses/collectPointsAbandonedTask`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      taskRealizationId,
      taskCreationId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error collecting points from task");
  }
  console.log(data);
  return data;
}

export async function markTaskAsCompleted(
  taskRealizationId: number,
  taskCreationId: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(`${API_URL}/api/businessProcesses/markTaskAsCompleted`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      taskRealizationId,
      taskCreationId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error marking task as completed");
  }
  console.log(data.message);
  return data;
}

export async function abandonedTask(
  taskRealizationId: number,
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(`${API_URL}/api/businessProcesses/abandonedTask`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({taskRealizationId}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error marking task as completed");
  }
  console.log(data.message);
  return data;
}


