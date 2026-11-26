import React, { useState } from 'react';
import TaskRealizationList from '../features/taskRealization/taskRealizationList';
import { UserHeader } from '../pages/User/UserHeader';
import { TabsNav } from '../components/navTab';
import CreateTaskModal from '../features/tasksCreation/createTaskModal';
import { Footer } from '../components/Footer';

const TaskRealizationPage: React.FC = () => {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const handleOpenCreateTaskModal = () => setIsCreateTaskModalOpen(true);
  const handleCloseCreateTaskModal = () => setIsCreateTaskModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen relative">
      <UserHeader />
      <TabsNav />
      <main className="flex-grow bg-[#F5F7FA]">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <h1 className="text-2xl text-[#4CAF4F] font-bold mb-6">Tarefa em Execução</h1>
          <TaskRealizationList />
        </div>
      </main>
      <Footer />

      {/* Botão flutuante */}
      <button
        onClick={handleOpenCreateTaskModal}
        className="fixed bottom-6 right-6 bg-[#4CAF4F] hover:bg-[#3e8e41] text-white px-6 py-3 rounded-full shadow-lg transition duration-300 cursor-pointer"
      >
        Criar Tarefa
      </button>

      {/* Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        onTaskCreated={handleCloseCreateTaskModal}
      />
    </div>
  );
};

export default TaskRealizationPage;
