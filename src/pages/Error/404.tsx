import React from 'react';
import { Link } from 'react-router-dom';
import { 
    HomeIcon, 
    ArrowLeftIcon, 
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';


export const NotFoundPage: React.FC = () => {
  const goBack = () => {window.history.back();};

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full space-y-8">
          <div>
            <ExclamationTriangleIcon 
              className="mx-auto h-16 w-auto text-yellow-500 sm:h-20" 
              aria-hidden="true" 
            />
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
              404
            </h1>
            <p className="mt-3 text-xl sm:text-2xl font-medium text-gray-700">
              Página Não Encontrada
            </p>
            <p className="mt-2 text-base text-gray-500">
              Pedimos desculpa, mas não conseguimos encontrar a página que procura.
            </p>
          </div>
          
          <div className="mt-10 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <HomeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Ir para a Página Inicial
            </Link>
            <button
              onClick={goBack}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Voltar
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};