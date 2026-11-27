import React from 'react';
import { SignalSlashIcon} from '@heroicons/react/24/outline';

export const ServiceUnavailablePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg w-full space-y-8">
          <div>
            <SignalSlashIcon className="mx-auto h-16 w-auto text-orange-500 sm:h-20" aria-hidden="true" />
            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Serviço Indisponível
            </h1>
          </div>
        </div>
      </main>
    </div>
  );
};