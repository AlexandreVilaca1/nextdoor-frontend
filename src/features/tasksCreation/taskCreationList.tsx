import React, { useEffect, useState } from 'react';
import { fetchTasks } from './taskCreationService';
import { criacaoTarefa } from './taskCreationTypes';
import TaskCard from './taskCreationCard';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<criacaoTarefa[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      }
    };

    loadTasks();
  }, []);

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-sm">De momento, nenhuma tarefa na sua vizinhança.</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {tasks.map((task, index) => (
        <TaskCard key={index} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
