// src/pages/taskRealizationPage.tsx
import React, { useState } from "react";
import TaskRealizationList from "../features/taskRealization/taskRealizationList";
import { UserHeader } from "../pages/User/UserHeader";

const TaskRealizationPage: React.FC = () => {
  const [listKey] = useState(0);

  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />

      <main className="flex-grow bg-[#F5F7FA]">
        <div className="container mx-auto px-4 pt-8 pb-8">
          <h1 className="text-2xl text-[#4CAF4F] font-bold mb-6">
            Tasks in execution
          </h1>
          <TaskRealizationList key={listKey} />
        </div>
      </main>
    </div>
  );
};

export default TaskRealizationPage;
