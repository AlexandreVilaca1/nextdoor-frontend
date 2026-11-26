import Cookies from 'js-cookie';
import { realizacaoTarefa } from './taskRealizationTypes';

export async function fetchTaskRealizations(): Promise<realizacaoTarefa[]> {
  const token = Cookies.get('jwt');

  const response = await fetch('http://localhost:3000/api/taskRealizations/inExecution', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar tarefas realizadas');
  }
  console.log(data.message);
  return data.task; 
}

export async function createTaskRealization(data: {
  criacaoTarefaidTarefaCriada: number;
}): Promise<any> {
  const token = Cookies.get('jwt');

  const response = await fetch('http://localhost:3000/api/taskRealizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Failed to create task realization');
  }
  console.log(responseData.message);
  return responseData.task;
}


  export async function updateTaskRealizationStatus(taskId: number, newState: number): Promise<void> {
    const token = Cookies.get('jwt');
  
    const response = await fetch(`http://localhost:3000/api/taskRealizations/edit/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ estadoRealizacaoTarefaidEstadoRealizacaoTarefa: newState }),
    });
  
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error updating task creation service');
    }
  
    console.log(data.message);
  }