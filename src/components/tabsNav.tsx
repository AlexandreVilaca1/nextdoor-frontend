import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Tab {
  label: string;
  path: string;
}

const TabsNav: React.FC<{ tabs: Tab[] }> = ({ tabs }) => {
  const location = useLocation();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 font-medium text-sm rounded-t-md ${
                isActive
                  ? 'bg-white border-b-2 border-[#4CAF4F] text-[#4CAF4F]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TabsNav;
