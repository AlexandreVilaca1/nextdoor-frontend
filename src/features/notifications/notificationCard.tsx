import React, { useState, useEffect } from 'react';
import { Notificacao } from './notificationTypes';
import { updateTaskCreationStatus, updateUserPoints } from '../tasksCreation/taskCreationService';
import { updateTaskRealizationStatus } from '../taskRealization/taskRealizationService';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const NotificationCard: React.FC<{ notification: Notificacao }> = ({ notification }) => {
  const [actionTaken, setActionTaken] = useState(false);

  const realizacao = notification.realizacaoTarefa;
  const criacao = realizacao?.criacaoTarefa;
  const utilizador = realizacao?.Utilizador;
  const estadoId = realizacao?.estadoRealizacaoTarefa?.idEstadoRealizacaoTarefa;
  const estadoNome = realizacao?.estadoRealizacaoTarefa?.estadoRealizacaoTarefa;

  useEffect(() => {
    const actionStatus = localStorage.getItem(`actionTaken-${notification.idNotificacao}`);
    if (actionStatus === 'true') {
      setActionTaken(true);
    }
  }, [notification.idNotificacao]);

  const handleAccept = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 7); // Validada
      const userPoints = realizacao.Utilizador.pontosUtilizador + criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(realizacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 4);
      localStorage.setItem(`actionTaken-${notification.idNotificacao}`, 'true');
      setActionTaken(true);
    } catch (error) {
      console.error("Erro ao aceitar a tarefa:", error);
      alert('Erro ao aceitar a tarefa');
    }
  };

  const handleReject = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 8); // Rejeitada
      const userPoints = criacao.Utilizador.pontosUtilizador + criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(criacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 7); //Aceite
      localStorage.setItem(`actionTaken-${notification.idNotificacao}`, 'true');
      setActionTaken(true);
    } catch (error) {
      console.error("Erro ao rejeitar a tarefa:", error);
      alert('Erro ao rejeitar a tarefa');
    }
  };

  const handleCollectPoints = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 5); // Cancelada
      const userPoints = criacao.Utilizador.pontosUtilizador + criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(criacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 5);
      localStorage.setItem(`actionTaken-${notification.idNotificacao}`, 'true');
      setActionTaken(true);
    } catch (error) {
      alert('Erro ao recolher pontos');
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-4 hover:bg-gray-50 transition duration-200">
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-semibold text-gray-800">
          {criacao?.nomeTarefa ?? 'Tarefa desconhecida'}
        </p>
        <span className="text-xs text-gray-500">
          {notification.dataEnvio ? formatDate(notification.dataEnvio) : 'Data desconhecida'}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-2">{notification.mensagem}</p>

      {criacao && (
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          {criacao.categoriaTarefa && (
            <p>
              <strong>Categoria:</strong> {criacao.categoriaTarefa.categoriaTarefa} ({criacao.categoriaTarefa.pontosCategoria} pontos)
            </p>
          )}
          {utilizador && (
            <p>
              <strong>Utilizador que executou:</strong> {utilizador.nomeUtilizador}
            </p>
          )}
          {estadoNome && (
            <p>
              <strong>Estado da realização:</strong> {estadoNome}
            </p>
          )}
        </div>
      )}

      {!actionTaken && (
        <div className="flex justify-end gap-2">
          {estadoId === 6 && (
            <>
              <button
                onClick={handleAccept}
                className="px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded"
              >
                Aceitar realização
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
              >
                Rejeitar realização
              </button>
            </>
          )}
          {estadoId === 5 && (
            <button
              onClick={handleCollectPoints}
              className="px-3 py-1 text-sm text-white bg-yellow-500 hover:bg-yellow-600 rounded"
            >
              Recolher pontos
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
