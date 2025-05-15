import React, { useState, useCallback } from 'react';
import CreateTaskModal from '../features/tasksCreation/createTaskModal';


interface HeaderProps {
  onTaskCreated?: () => void; 
}

export const Header: React.FC<HeaderProps> = ({ onTaskCreated }) => {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const handleOpenCreateTaskModal = () => setIsCreateTaskModalOpen(true);
  const handleCloseCreateTaskModal = () => setIsCreateTaskModalOpen(false);

  const handleTaskSuccessfullyCreated = useCallback((newTask: any) => {
    console.log('Nova tarefa criada no Header:', newTask);
    if (onTaskCreated) {
      onTaskCreated(); 
    }
    handleCloseCreateTaskModal(); 
  }, [onTaskCreated]);

  return (
    <>
      <div className='h-20 w-full font-[Inter] flex justify-between px-4 sm:px-8 md:px-16 lg:px-24 items-center bg-white shadow-md'>
        {/* Lado Esquerdo: Logo e Nome */}
        <div>
          <a href="/home" className='flex items-center'>
            <img src="/icon.png" alt="NextDoor Logo" className='w-[40px] h-[40px]' />
            <h1 className='font-bold text-[#5A5A5A] text-xl ml-2'>NextDoor</h1>
          </a>
        </div>

        {/* Lado Direito: Botão Criar Tarefa */}
        <div className='flex items-center'>
          <button
            onClick={handleOpenCreateTaskModal}
            className="bg-[#4CAF4F] hover:bg-[#3e8e41] text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
            aria-label="Criar nova tarefa"
          >
            Criar Tarefa
          </button>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        onTaskCreated={handleTaskSuccessfullyCreated}
      />
    </>
  );
};

// export default Header; // ou mantenha export const Header