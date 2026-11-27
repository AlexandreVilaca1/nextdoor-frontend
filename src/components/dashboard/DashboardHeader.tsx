import { API_URL } from "../../config/api";
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import "../../styles.css"; 
import {
    Cog8ToothIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface AdminUserData {
  idUtilizador: number;
  nomeUtilizador: string;
  emailUtilizador?: string;
  tipoUtilizadoridTipoUtilizador: number; 
}

export const DashboardHeader: React.FC = () => {
  const [showAdminMenu, setShowAdminMenu] = useState(false); 
  const [currentAdmin, setCurrentAdmin] = useState<AdminUserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoadingUser(true);
      const localToken = Cookies.get('jwt');

      if (localToken) {
        try {
          const response = await axios.get<{ user: AdminUserData }>( 
            `${API_URL}/api/users/profile`,
            {
              headers: { Authorization: `Bearer ${localToken}` }, 
            }
          );

          if (response.data && response.data.user) {
            const userDataFromApi = response.data.user;

            if (userDataFromApi.tipoUtilizadoridTipoUtilizador !== 1) {
              console.warn("DashboardHeader: Usuário logado não é administrador. Acesso negado.");
              Cookies.remove('jwt'); 
              setCurrentAdmin(null);
              if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
                window.location.href = '/login'; 
              }
              setIsLoadingUser(false); 
              return; 
            }

            if (userDataFromApi.nomeUtilizador) {
              setCurrentAdmin(userDataFromApi);
            } else {
              console.warn("DashboardHeader: 'nomeUtilizador' não encontrado nos dados do administrador.");
              setCurrentAdmin(null);
            }
          } else {
            console.warn("DashboardHeader: Estrutura de resposta da API inesperada ou usuário não encontrado.");
            setCurrentAdmin(null);
          }
        } catch (error) {
          console.error("DashboardHeader: Erro ao buscar dados do administrador:", error);
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              Cookies.remove('jwt');
              if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
                window.location.href = '/login';
              }
            }
          }
          setCurrentAdmin(null); 
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setIsLoadingUser(false);
        setCurrentAdmin(null);
        console.log("DashboardHeader: Nenhum token JWT encontrado.");
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.href = '/login';
        }
      }
    };

    fetchAdminData();
  }, []); 

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAdminMenu(prev => !prev);
  };

  const handleLogout = () => {
    Cookies.remove('jwt');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    if (showAdminMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdminMenu]);

  return (
    <header className="bg-white shadow px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {isLoadingUser ? (
          <div className="h-8 w-24 sm:w-32 bg-gray-200 animate-pulse rounded-md"></div>
        ) : currentAdmin ? (
          <div className="flex items-center relative" ref={menuRef}>
              <span className="text-[#5A5A5A] pr-3.5 text-sm sm:text-base"><strong>{currentAdmin.nomeUtilizador}</strong></span>
              <button
                onClick={handleMenuToggle}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                aria-label="Menu do utilizador"
              >
                <img src="/man.png"  className="w-8 h-8 rounded-full object-cover cursor-pointer" />
              </button>
              {showAdminMenu && (
                <div className="origin-top-right absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md w-52  py-1 ring-1 ring-black ring-opacity-5 z-20 animate-modalFadeInScale">
                  <a
                      href="/tasksCreated" 
                      onClick={() => setShowAdminMenu(false)}
                      className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                      role="menuitem"
                    >
                      <Cog8ToothIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      Página Utilizador
                    </a>
                  <button
                      onClick={handleLogout}
                      className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                      role="menuitem"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      Terminar Sessão
                    </button>
                </div>
              )}
            </div>
        ) : (
          <div className='flex items-center space-x-3'>
            <a href="/login" className='text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors'>
              Login
            </a>
          </div>          
        )}
      </div>
    </header>
  );
};