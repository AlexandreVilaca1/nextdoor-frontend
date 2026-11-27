import React from 'react';
import { Link } from 'react-router-dom';
import { LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md w-full space-y-8">
          <div>
            <LockClosedIcon 
              className="mx-auto h-16 w-auto text-orange-500 sm:h-20" 
              aria-hidden="true" 
            />
            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Acesso Requerido
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-700">
              Você precisa estar autenticado para aceder esta página.
            </p>
            <p className="mt-2 text-base text-gray-500">
              Sua sessão pode ter expirado ou você ainda não fez login.
            </p>
          </div>
          
          <div className="mt-10">
            <Link
              to="/login" 
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Fazer Login
            </Link>
          </div>

           <div className="mt-4">
            <Link to="/" className="text-sm font-medium text-green-600 hover:text-green-500">
              Ou volte para a página inicial
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};