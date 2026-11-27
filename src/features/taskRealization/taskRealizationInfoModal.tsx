import React, { useEffect, useState } from 'react';
import { realizacaoTarefa } from './taskRealizationTypes';
import { abandonedTask, markTaskAsCompleted } from '../businessProcessTasksAndPoints/businessProcessService';

interface TaskRealizationModalProps {
  task: realizacaoTarefa;
  onClose: () => void;
  onUpdate: () => void; 
}

const TaskRealizationModal: React.FC<TaskRealizationModalProps> = ({ task, onClose, onUpdate }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const handleConcluida = async () => {
    try {
      await markTaskAsCompleted(task.idRealizacaoTarefa, task.criacaoTarefa.idTarefaCriada);
      console.log('Notification sended successfully');
      alert('Verificação precisa pelo criador da tarefa ! ');
      handleClose();
      onUpdate();  
    } catch (error) {
      console.error("Error sending the notification:", error);
      alert('Error sending the notification');
    }
  };

  const handleAbandonar = async () => {
    try {
      await abandonedTask(task.idRealizacaoTarefa)
      console.log('Notification sended successfully');
      alert('Task completion abandoned');
      handleClose();
      onUpdate();  
    } catch (error) {
      console.error("Error sending the notification:", error);
      alert('Error sending the notification');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${show ? "opacity-50" : "opacity-0"}`} />

      {/* Modal */}
      <div className={`relative bg-white shadow-xl rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{task.criacaoTarefa.nomeTarefa}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-red-600 cursor-pointer font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-700"><strong>Descrição:</strong> {task.criacaoTarefa.descricaoTarefa}</p>
        <p className="text-sm text-gray-700"><strong>Início:</strong> {task.criacaoTarefa.dataInicio}</p>
        <p className="text-sm text-gray-700"><strong>Fim:</strong> {task.criacaoTarefa.dataFim}</p>

        <p className="text-sm text-gray-700 mt-2">
          <strong>Categoria:</strong> {task.criacaoTarefa.categoriaTarefa.categoriaTarefa} ({task.criacaoTarefa.categoriaTarefa.pontosCategoria} pontos)
        </p>

        <p className="text-sm text-gray-700 mt-2">
          <strong>Estado da realização:</strong> {task.estadoRealizacaoTarefa.estadoRealizacaoTarefa}
        </p>

        <p className="text-sm text-gray-700 mt-2">
          <strong>Criador:</strong> {task.criacaoTarefa.Utilizador.nomeUtilizador}
        </p>

        <p className="text-sm text-gray-700 mb-4">
          <strong>Endereço:</strong> {task.criacaoTarefa.Utilizador.Endereco.rua}, {task.criacaoTarefa.Utilizador.Endereco.numeroPorta}, {task.criacaoTarefa.Utilizador.Endereco.codigoPostal}
        </p>

        {/* Botões Concluída e Cancelar */}
        <div className="flex justify-end space-x-4">
          <button
          className="px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-md hover:bg-red-500 focus:outline-none cursor-pointer"
            onClick={handleAbandonar}
            >
            Abandonar
          </button>
          <button
            onClick={handleConcluida}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4CAF4F] rounded-md hover:bg-[#3e8e41] focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            Concluída
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskRealizationModal;
