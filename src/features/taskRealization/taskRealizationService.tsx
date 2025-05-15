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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create task realization' }));
    throw new Error(errorData.error || 'Failed to create task realization');
  }

  const responseData = await response.json();
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
  
    if (!response.ok) {
      throw new Error('Error updating task creation service');
    }
  
    const data = await response.json();
    console.log(data.message);
  }