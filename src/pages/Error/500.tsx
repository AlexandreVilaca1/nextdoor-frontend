import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationCircleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export const InternalServerErrorPage: React.FC = () => {
  const handleTryAgain = () => {window.location.reload();};

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg w-full space-y-8">
          <div>
            <ExclamationCircleIcon 
              className="mx-auto h-16 w-auto text-red-600 sm:h-20" 
              aria-hidden="true" 
            />
            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Oops! Algo deu errado.
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-700">
            </p>
            <p className="mt-2 text-base text-gray-500">
              Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
          
          <div className="mt-10 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            <button
              onClick={handleTryAgain}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Tentar Novamente
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Página Inicial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};