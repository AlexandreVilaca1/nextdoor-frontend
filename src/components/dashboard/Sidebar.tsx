
import React from "react";
import { useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin-user", label: "Utilizadores" },
    { path: "/admin-task", label: "Tarefas" },
    { path: "/task-categories", label: "Categorias de Tarefas" },
    { path: "/admin-product", label: "Produtos" },
    { path: "/admin-establishments", label: "Estabelecimentos" },
    { path: "/codes", label: "Códigos & Resgates" },
    { path: "/reports", label: "Denúncias" },
    { path: "/notifications", label: "Notificações" },
    { path: "/settings", label: "Definições" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen px-6 py-8">
      <h2 className="text-xl font-bold text-green-600 mb-6">Painel Admin</h2>
      <nav className="flex flex-col space-y-4 text-sm">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`text-gray-700 hover:text-green-600 ${location.pathname === item.path ? "font-bold text-green-600" : ""}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};