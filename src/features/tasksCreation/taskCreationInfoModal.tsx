import { useEffect, useState } from "react";
import React from 'react';
import { criacaoTarefa } from './taskCreationTypes';
import {createTaskRealization} from "../taskRealization/taskRealizationService"
import { updateTaskCreationStatus } from "./taskCreationService";

interface TaskCreationModalProps {
  task: criacaoTarefa;
  onClose: () => void;
}

const TaskModal: React.FC<TaskCreationModalProps> = ({ task, onClose }) => {
  const [show, setShow] = useState(false);
  

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleTaskRealization = async () => {
    try {
      await createTaskRealization({
        criacaoTarefaidTarefaCriada: task.idTarefaCriada
      });
  
      await updateTaskCreationStatus(task.idTarefaCriada, 3); //Aceite
    //
  
      alert("Now you can see your task in execution on the page running task");
      handleClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${show ? "opacity-50" : "opacity-0"}`} />

      {/* Modal Content */}
      <div
        className={`relative bg-white shadow-xl rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out
        ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{task.nomeTarefa}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-red-600 cursor-pointer font-bold text-xl"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-gray-700"><strong>Descrição:</strong> {task.descricaoTarefa}</p>
        <p className="text-sm text-gray-700"><strong>Início:</strong> {task.dataInicio}</p>
        <p className="text-sm text-gray-700"><strong>Fim:</strong> {task.dataFim}</p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Categoria:</strong> {task.categoriaTarefa.categoriaTarefa} ({task.categoriaTarefa.pontosCategoria} pontos)
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Criado por:</strong> {task.Utilizador.nomeUtilizador}
        </p>
        <p className="text-sm text-gray-700 mb-4">
          <strong>Endereço:</strong> {task.Utilizador.Endereco.rua}, {task.Utilizador.Endereco.numeroPorta}, {task.Utilizador.Endereco.codigoPostal}
        </p>

        {/* Botão Realizar */}
        <div className="flex justify-end">
          <button
            onClick={handleTaskRealization}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Realizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
