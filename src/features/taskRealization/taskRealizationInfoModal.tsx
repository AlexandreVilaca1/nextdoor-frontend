import React, { useEffect, useState } from 'react';
import { realizacaoTarefa } from './taskRealizationTypes';
import { createNotification } from '../notifications/notificationService';
import { updateTaskRealizationStatus } from './taskRealizationService';
import { updateTaskCreationStatus } from '../tasksCreation/taskCreationService';

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
      const message = `O seu vizinho concluiu a tarefa, por favor comprove a conclusão da tarefa`;
      const taskRealizationId = task.idRealizacaoTarefa;
      await updateTaskRealizationStatus(taskRealizationId, 6); // em espera de comprovação
      await updateTaskCreationStatus(task.criacaoTarefa.idTarefaCriada, 9);
      await createNotification(message, taskRealizationId);
      console.log('Notification sended successfully');
      alert('Verify needed from task creator');
      handleClose();
      onUpdate();  
    } catch (error) {
      console.error("Error sending the notification:", error);
      alert('Error sending the notification');
    }
  };

  const handleCancelar = async () => {
    try {
      const message = `O seu vizinho não realizou a tarefa, por favor recolha os seus pontos`;
      const taskRealizationId = task.idRealizacaoTarefa;
      await updateTaskCreationStatus(task.criacaoTarefa.idTarefaCriada, 5);
      await updateTaskRealizationStatus(taskRealizationId, 5); // estado cancelada
      await createNotification(message, taskRealizationId);
      console.log('Notification sended successfully');
      alert('Task completion cancelled');
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
          className="px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-md hover:bg-red-500 focus:outline-none"
            onClick={handleCancelar}
            >
            Cancelar Realização
          </button>
          <button
            onClick={handleConcluida}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4CAF4F] rounded-md hover:bg-[#3e8e41] focus:outline-none disabled:opacity-50"
          >
            Concluída
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskRealizationModal;
