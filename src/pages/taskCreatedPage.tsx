import React, { useState } from 'react'; 
import TaskList from '../features/tasksCreation/taskCreationList';
import { UserHeader } from './User/UserHeader'; // Atualizado de Header para UserHeader

const Tasks: React.FC = () => {
  const [taskListKey, setTaskListKey] = useState(0);

  const handleTaskCreatedInPage = () => {
    console.log("Task created signal received in Tasks page.");
    setTaskListKey(prevKey => prevKey + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader onTaskCreated={handleTaskCreatedInPage} />
      <main className="flex-grow bg-[#F5F7FA]">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <h1 className="text-2xl text-[#4CAF4F] font-bold mb-6">Neighborhood Tasks</h1>
          <TaskList key={taskListKey} />
        </div>
      </main>
    </div>
  );
};

export default Tasks;
