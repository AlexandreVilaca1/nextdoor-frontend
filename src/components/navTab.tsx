import { NavLink } from "react-router-dom";

export function TabsNav() {
  return (
    <div className="bg-[#F5F7FA] flex justify-center py-4">
      <nav className="flex space-x-8">
        <NavLink
          to="/tasksCreated"
          className={({ isActive }) =>
            isActive
              ? "text-[#4CAF4F] font-semibold border-b-2 border-[#4CAF4F] pb-1"
              : "text-gray-500 hover:text-[#4CAF4F] pb-1"
          }
        >
          Tarefas Criadas
        </NavLink>
        <NavLink
          to="/tasksRealization"
          className={({ isActive }) =>
            isActive
              ? "text-[#4CAF4F] font-semibold border-b-2 border-[#4CAF4F] pb-1"
              : "text-gray-500 hover:text-[#4CAF4F] pb-1"
          }
        >
          Tarefa em Execução
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive
              ? "text-[#4CAF4F] font-semibold border-b-2 border-[#4CAF4F] pb-1"
              : "text-gray-500 hover:text-[#4CAF4F] pb-1"
          }
        >
          Notificações
        </NavLink>
      </nav>
    </div>
  );
}
