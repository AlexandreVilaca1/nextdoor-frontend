// src/components/taskRealization/TaskRealizationCard.tsx
import React, { useState } from 'react';
import { realizacaoTarefa } from './taskRealizationTypes';
import TaskRealizationModal from './taskRealizationInfoModal';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getSubtitle = (descricao: string): string => {
  const firstSentenceMatch = descricao.match(/^[^.!?]+[.!?]/);
  if (firstSentenceMatch && firstSentenceMatch[0].length < 70) {
    return firstSentenceMatch[0].trim();
  }
  if (descricao.length <= 60) {
    return descricao;
  }
  const truncated = descricao.substring(0, descricao.lastIndexOf(' ', 60));
  return `${truncated}...`;
};

const getCategoryAccentColor = (categoria: string): string => {
  switch (categoria) {
    case 'Reparações': return 'bg-yellow-500';
    case 'Limpeza': return 'bg-blue-500';
    case 'Jardinagem': return 'bg-green-600';
    case 'Animais': return 'bg-red-600';
    case 'Cozinha': return 'bg-pink-200';
    case 'Compras': return 'bg-purple-600';
    default: return 'bg-gray-400';
  }
};

const TaskRealizationCard: React.FC<{ task: realizacaoTarefa }> = ({ task }) => {
  const [showModal, setShowModal] = useState(false);

  const categoria = task.criacaoTarefa.categoriaTarefa;
  const cor = getCategoryAccentColor(categoria.categoriaTarefa);

  return (
    <>
      <div className="flex flex-col h-full py-2 container2">
        <div className="flex items-center mb-1">
          <div className={`w-1 h-3.5 ${cor} mr-2.5 rounded-sm`}></div>
          <p className="text-xs text-gray-500">
            {formatDate(task.criacaoTarefa.dataInicio)}
          </p>
        </div>

        <div className="mb-1.5">
          <p className="text-xs text-gray-500">
            {categoria.categoriaTarefa} - <span className="font-medium text-gray-600"><strong>{categoria.pontosCategoria} Pontos</strong></span>
          </p>
        </div>

        <h3
          className="text-base font-semibold text-gray-800 mb-1 hover:text-[#1f4d20] cursor-pointer leading-tight"
          onClick={() => setShowModal(true)}
        >
          {task.criacaoTarefa.nomeTarefa}
        </h3>

        <p className="text-xs text-gray-600 mb-2.5 flex-grow">
          {getSubtitle(task.criacaoTarefa.descricaoTarefa)}
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="text-[#4CAF4F] hover:text-[#1f4d20] cursor-pointer font-semibold text-xs flex items-center group self-start"
        >
          Ver detalhes
          <span className="ml-1 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      {showModal && (
        <TaskRealizationModal task={task} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default TaskRealizationCard;
