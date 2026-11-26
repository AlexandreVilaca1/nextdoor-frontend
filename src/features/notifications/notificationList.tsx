import React, { useEffect, useState } from "react";
import NotificationCard from "./notificationCard";
import { Notificacao } from "./notificationTypes";
import { fetchNotifications } from "./notificationService";

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);

  const loadNotifications = async (currentPage: number) => {
    try {
      const data = await fetchNotifications(currentPage);
      setNotifications(data.notifications);
      setTotal(data.total);
      setLimit(data.limit);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar notificações");
    }
  };

  useEffect(() => {
    loadNotifications(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma notificação encontrada.</p>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-gray-200">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.idNotificacao}
                notification={notification}
              />
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
      )}
    </div>
  );
};

export default NotificationList;
