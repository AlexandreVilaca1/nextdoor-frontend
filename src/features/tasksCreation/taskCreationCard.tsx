import React, { useState } from 'react';
import { criacaoTarefa } from './taskCreationTypes';
import TaskModal from './taskCreationInfoModal';  

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

interface TaskCardProps {
  task: criacaoTarefa;
  onUpdate: () => void;   // nova prop para atualizar lista
}

const TaskCard: React.FC<TaskCardProps> = ({ task: tarefa, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const categoriaNome = tarefa.categoriaTarefa.categoriaTarefa;
  const categoriaPontos = tarefa.categoriaTarefa.pontosCategoria;
  const accentColorClass = getCategoryAccentColor(categoriaNome);

  return (
    <>
      <div className="flex flex-col h-full p-4 m-2 rounded-xl bg-gray-100 border border-gray-200">
        <div className="flex items-center mb-1">
          <div className={`w-1 h-3.5 ${accentColorClass} mr-2.5 rounded-sm`}></div>
          <p className="text-xs text-gray-500">
            {formatDate(tarefa.dataInicio)}
          </p>
        </div>

        <div className="mb-1.5">
          <p className="text-xs text-gray-500">
            {categoriaNome} - <span className="font-medium text-gray-600"><strong>{categoriaPontos} Pontos</strong></span>
          </p>
        </div>

        <h3
          className="text-base font-semibold text-gray-800 mb-1 hover:text-[#1f4d20] cursor-pointer leading-tight"
          onClick={() => setShowModal(true)}
          title={tarefa.nomeTarefa}
        >
          {tarefa.nomeTarefa}
        </h3>

        <p className="text-xs text-gray-600 mb-2.5 flex-grow">
          {getSubtitle(tarefa.descricaoTarefa)}
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
        <TaskModal 
          task={tarefa} 
          onClose={() => setShowModal(false)} 
          onUpdate={onUpdate}   // passa a função de atualização
        />
      )}
    </>
  );
};

export default TaskCard;
