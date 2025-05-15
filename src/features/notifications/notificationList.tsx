// src/features/notifications/notificationList.tsx
import React, { useEffect, useState } from 'react';
import NotificationCard from './notificationCard';
import { Notificacao } from './notificationTypes';
import { fetchNotifications } from './notificationService';

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar notificações');
      }
    };

    loadNotifications();
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (notifications.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhuma notificação encontrada.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {notifications.map((notification) => (
        <NotificationCard key={notification.idNotificacao} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationList;
