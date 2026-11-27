import React, { useEffect, useState } from 'react';
import { fetchTasks } from './taskCreationService';
import { criacaoTarefa } from './taskCreationTypes';
import TaskCard from './taskCreationCard';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<criacaoTarefa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(40);

  const loadTasks = async (currentPage: number) => {
    try {
      const data = await fetchTasks(currentPage);
      setTasks(data.task);
      setTotal(data.total);
      setLimit(data.limit);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks(page);
  }, [page]);

  const totalPages = total && limit ? Math.ceil(total / limit) : 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-sm">De momento, nenhuma tarefa na sua vizinhança.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.idTarefaCriada} task={task} onUpdate={() => loadTasks(page)} />
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-700">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
        >
          Seguinte
        </button>
      </div>
    </>
  );
};

export default TaskList;
