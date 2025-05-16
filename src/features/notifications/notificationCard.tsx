import React, { useState, useEffect } from "react";
import { Notificacao } from "./notificationTypes";
import {
  updateTaskCreationStatus,
  updateUserPoints,
} from "../tasksCreation/taskCreationService";
import { updateTaskRealizationStatus } from "../taskRealization/taskRealizationService";
import { fetchNotificationById } from "./notificationService"; // importa a nova função

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NotificationCard: React.FC<{ notification: Notificacao }> = ({
  notification: initialNotification,
}) => {
  const [notification, setNotification] = useState<Notificacao>(initialNotification);
  const [actionTaken, setActionTaken] = useState(false);

  const realizacao = notification.realizacaoTarefa;
  const criacao = realizacao?.criacaoTarefa;
  const utilizador = realizacao?.Utilizador;
  const estadoId = criacao?.estadoCriacaoTarefa?.idEstadoCriacaoTarefa;
  const estadoNome = criacao?.estadoCriacaoTarefa?.estadoCriacaoTarefa;

  useEffect(() => {
    const actionStatus = localStorage.getItem(
      `actionTaken-${notification.idNotificacao}`
    );
    if (actionStatus === "true") {
      setActionTaken(true);
    }
  }, [notification.idNotificacao]);

  const refreshNotification = async () => {
    try {
      const updatedNotification = await fetchNotificationById(notification.idNotificacao);
      setNotification(updatedNotification);
      setActionTaken(true);
      localStorage.setItem(`actionTaken-${notification.idNotificacao}`, "true");
    } catch (error: any) {
      console.error("Failed to refresh notification:", error);
    }
  };

  const handleAccept = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 7); // Validada
      const userPoints =
        realizacao.Utilizador.pontosUtilizador +
        criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(realizacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 4);
      await refreshNotification(); // atualiza a notificação depois da ação
    } catch (error: any) {
      console.error("Error accepting task:", error);
      alert(error.message);
    }
  };

  const handleReject = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 8); // Rejeitada
      const userPoints =
        criacao.Utilizador.pontosUtilizador +
        criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(criacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 7); // Rejeitada
      await refreshNotification();
    } catch (error: any) {
      console.error("Error rejecting task:", error);
      alert(error.message);
    }
  };

  const handleCollectPoints = async () => {
    try {
      await updateTaskCreationStatus(criacao.idTarefaCriada, 5); // Cancelada
      const userPoints =
        criacao.Utilizador.pontosUtilizador +
        criacao.categoriaTarefa.pontosCategoria;
      await updateUserPoints(criacao.Utilizador.idUtilizador, userPoints);
      await updateTaskRealizationStatus(realizacao.idRealizacaoTarefa, 5);
      await refreshNotification();
    } catch (error: any) {
      console.error("Error collecting points:", error);
      alert(error.message);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-4 hover:bg-gray-50 transition duration-200">
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-semibold text-gray-800">
          {criacao?.nomeTarefa ?? "Tarefa desconhecida"}
        </p>
        <span className="text-xs text-gray-500">
          {notification.dataEnvio
            ? formatDate(notification.dataEnvio)
            : "Data desconhecida"}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-2">{notification.mensagem}</p>

      {criacao && (
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          {criacao.categoriaTarefa && (
            <p>
              <strong>Categoria:</strong>{" "}
              {criacao.categoriaTarefa.categoriaTarefa} (
              {criacao.categoriaTarefa.pontosCategoria} pontos)
            </p>
          )}
          {utilizador && (
            <p>
              <strong>Utilizador que executou:</strong> {utilizador.nomeUtilizador}
            </p>
          )}
          {estadoNome && (
            <p>
              <strong>Estado da tarefa:</strong> {estadoNome}
            </p>
          )}
        </div>
      )}

      {!actionTaken && (
        <div className="flex flex-col items-end space-y-2">
          {estadoId === 9 && (
            <>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4CAF4F] rounded-md hover:bg-[#3e8e41] focus:outline-none disabled:opacity-50"
              >
                Aceitar realização
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-md hover:bg-red-500 focus:outline-none"
              >
                Rejeitar realização
              </button>
            </>
          )}
          {estadoId === 5 && (
            <button
              onClick={handleCollectPoints}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
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
