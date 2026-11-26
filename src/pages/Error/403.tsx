import React from 'react';
import { Link } from 'react-router-dom';
import { HandRaisedIcon, HomeIcon } from '@heroicons/react/24/outline';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full space-y-8">
          <div>
            <HandRaisedIcon 
              className="mx-auto h-16 w-auto text-red-500 sm:h-20" 
              aria-hidden="true" 
            />
            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Acesso Negado
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-700">
              Você não tem permissão para aceder este recurso.
            </p>
          </div>
          
          <div className="mt-10">
            <Link
              to="/" 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <HomeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Voltar para a Página Inicial
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
};