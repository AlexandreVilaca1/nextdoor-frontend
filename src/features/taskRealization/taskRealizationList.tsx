import React, { useEffect, useState, useCallback } from 'react';
import TaskRealizationCard from './taskRealizationCard';
import { realizacaoTarefa } from './taskRealizationTypes';
import { fetchTaskRealizations } from './taskRealizationService';

const TaskRealizationList: React.FC = () => {
  const [realizations, setRealizations] = useState<realizacaoTarefa[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchTaskRealizations();
      const sortedData = data.sort((a, b) => {
        return new Date(b.dataRealizacao).getTime() - new Date(a.dataRealizacao).getTime();
      });
      setRealizations(sortedData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error fetching tasks');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (realizations.length === 0) {
    return <p className="text-gray-500 text-sm">De momento, nenhuma tarefa em realização.</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {realizations.map((realization) => (
        <TaskRealizationCard 
          key={realization.idRealizacaoTarefa} 
          task={realization} 
          onUpdate={loadData} // Passa a função para atualizar
        />
      ))}
    </div>
  );
};

export default TaskRealizationList;
