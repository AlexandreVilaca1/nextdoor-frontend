import {
  categoriaTarefa,
  CreateTaskPayload,
  criacaoTarefa,
} from "./taskCreationTypes";
import Cookies from "js-cookie";

export async function fetchTasks(): Promise<criacaoTarefa[]> {
  const token = Cookies.get("jwt");

  const response = await fetch(
    "http://localhost:3000/api/taskCreations/neighborhood/",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = await response.json();
  return data.task;
}

export async function updateTaskCreationStatus(
  taskId: number,
  newState: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(
    `http://localhost:3000/api/taskCreations/edit/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        estadoCriacaoTarefaidEstadoCriacaoTarefa: newState,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error updating task creation service");
  }

  console.log(data.message);
  console.log("Status changed sucessfully");
}

export async function updateUserPoints(
  userId: number,
  points: number
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(
    `http://localhost:3000/api/users/edit/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",

      body: JSON.stringify({ pontosUtilizador: points }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error updating user points");
  }

  console.log(data.message);
  console.log("User updated successfully");
}

export async function updateUserStatus(
  userId: number,
  state: string
): Promise<void> {
  const token = Cookies.get("jwt");

  const response = await fetch(
    `http://localhost:3000/api/users/edit/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",

      body: JSON.stringify({ estadoUtilizadoridEstadoUtilizador: state }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error updating user state");
  }

  if (data.revokeToken) {
    Cookies.remove("jwt");
    window.location.href = "/login";
    return;
  }

  console.log(data.message);
  console.log("User updated successfully");
}

export async function fetchCategories(): Promise<categoriaTarefa[]> {
  const token = Cookies.get("jwt");
  const response = await fetch("http://localhost:3000/api/categories", {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const data = await response.json();
  
  if (!response.ok) {
  throw new Error(data.error || "Failed to fetch categories");
}

  console.log(data.message)
  return data.categories;
}

export async function createTask(
  taskData: CreateTaskPayload
): Promise<criacaoTarefa> {
  const token = Cookies.get("jwt");
  const response = await fetch(
    `http://localhost:3000/api/taskCreations/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(taskData),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
  throw new Error(data.error || "Failed to create task");
}
  console.log(data.message);
  return data.task;
}
