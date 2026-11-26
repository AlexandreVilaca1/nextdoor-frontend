import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import "../../styles.css"; 
import {
    MapPinIcon,
    TicketIcon,
    StarIcon,
    Cog8ToothIcon,
    ArrowLeftOnRectangleIcon,
    PencilSquareIcon 
} from '@heroicons/react/24/outline';

interface UserDataFromAPI {
  idUtilizador: number;
  nomeUtilizador: string;
  emailUtilizador?: string;
  dataNascimento?: string;
  pontosUtilizador?: number;
  comprovativoResidencia?: string;
  utilizadorLogin?: string;
  Vizinhanca?: {
    idVizinhanca: number;
    nomeFreguesia: string;
  };
  tipoUtilizadoridTipoUtilizador?: number; 
}

interface UserHeaderProps {
  onTaskCreated?: () => void; 
}

export const UserHeader: React.FC<UserHeaderProps> = ({ onTaskCreated }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDataFromAPI | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      const localToken = Cookies.get('jwt');

      if (localToken) {
        try {
          const response = await axios.get<{ user: UserDataFromAPI }>(
            'http://localhost:3000/api/users/profile', 
            {
              headers: { Authorization: `Bearer ${localToken}` },
            }
          );

          if (response.data && response.data.user) {
            const userDataFromApi = response.data.user;
            if (userDataFromApi.nomeUtilizador && userDataFromApi.tipoUtilizadoridTipoUtilizador !== undefined) {
              setCurrentUser(userDataFromApi);
            } else {
              console.warn("UserHeader: 'nomeUtilizador' ou 'tipoUtilizadoridTipoUtilizador' não encontrado(s) na API.");
              setCurrentUser(null);
            }
          } else {
            console.warn("UserHeader: Estrutura de resposta da API inesperada ou usuário não encontrado.");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("UserHeader: Erro ao buscar dados do usuário:", error);
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              Cookies.remove('jwt');
            }
          }
          setCurrentUser(null);
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setIsLoadingUser(false);
        setCurrentUser(null);
      }
    };
    fetchUserData();
  }, []); 

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  };

  /*Função de logout*/
  const handleLogout = () => {
    Cookies.remove('jwt');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  /*Efeito para fechar o menu ao clicar fora*/
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const isAdmin = currentUser?.tipoUtilizadoridTipoUtilizador === 1;

  return (
    <>
      <header className='bg-white shadow-sm h-20 w-full font-[Inter] flex justify-between px-4 sm:px-8 md:px-16 items-center sticky top-0 z-50'>
        {/* Logo e Nome do Site */}
        <div className='flex items-center'>
          <a href="/" className='flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md p-1 -ml-1'>
            <img src="/icon.png" alt="NextDoor Logo" className='w-9 h-9 sm:w-10 sm:h-10' />
            <h1 className='font-bold text-gray-700 text-lg sm:text-xl ml-2 hidden sm:block hover:text-black transition-colors'>NextDoor</h1>
          </a>

          {/* Informação da Vizinhança */}
          {currentUser && currentUser.Vizinhanca && (
            <div className="ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-gray-200 hidden md:flex items-center">
              <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium truncate" title={currentUser.Vizinhanca.nomeFreguesia}>
                {currentUser.Vizinhanca.nomeFreguesia}
              </span>
            </div>
          )}
        </div>

        {/* Navegação e Menu do Utilizador */}
        <nav className='flex items-center space-x-4 sm:space-x-6'>
          <ul className='flex space-x-3 sm:space-x-4 items-center text-gray-600 text-sm sm:text-base'>
            <li><a href="/user-product" className='font-medium hover:text-black transition-colors px-1 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500'>Produtos</a></li>
            <li><a href="/tasksCreated" className='font-medium hover:text-black transition-colors px-1 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500'>Tarefas</a></li>
          </ul>
          
          {/* Bloco do Usuário (Logado) ou Botões de Login/Registro */}
          {isLoadingUser ? (
            <div className="h-8 w-24 sm:w-32 bg-gray-200 animate-pulse rounded-md"></div>
          ) : currentUser ? (
            <div className="flex items-center relative" ref={menuRef}>

              {/* Nome do Utilizador */}
              <span className="text-gray-700 pr-2 sm:pr-3 text-sm sm:text-base font-semibold hidden md:block truncate" title={currentUser.nomeUtilizador}>
                {currentUser.nomeUtilizador}
              </span>

              {/* Botão do Icon/Menu */}
              <button
                onClick={handleMenuToggle}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                aria-label="Menu do utilizador"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <img src="/man.png" alt="Avatar do Utilizador" className="w-full h-full rounded-full object-cover" />
              </button>

              {/* Menu Dropdown */}
              {showUserMenu && (
                <div
                  className="origin-top-right absolute right-0 top-full mt-2 w-60 bg-white rounded-md shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-modalFadeInScale"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Informações do Utilizador no Topo do Menu */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800 truncate" title={currentUser.nomeUtilizador}>{currentUser.nomeUtilizador}</p>
                    <p className="text-xs text-gray-500 truncate" title={currentUser.emailUtilizador || 'Email não disponível'}>
                      {currentUser.emailUtilizador || 'Email não disponível'}
                    </p>
                  </div>
                  
                  {/* Meus Pontos */}
                  <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 border-t border-gray-100">
                    <span className="flex items-center">
                      <StarIcon className="h-5 w-5 mr-2.5 text-yellow-500" />
                      Meus Pontos:
                    </span>
                    <span className="font-semibold text-green-600">
                      {currentUser.pontosUtilizador ?? 'N/A'}
                    </span>
                  </div>

                  {/* Link para Editar Perfil */}
                  <a
                    href="/edit-profile" 
                    onClick={() => setShowUserMenu(false)}
                    className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    <PencilSquareIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    Editar Perfil
                  </a>              

                  {/* Meus Resgates */}
                  <a
                    href="/usercodes"
                    onClick={() => setShowUserMenu(false)}
                    className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                    role="menuitem"
                  >
                    <TicketIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    Meus Resgates
                  </a>

                  {/* Link para Dashboard Admin s*/}
                  {isAdmin && (
                    <a
                      href="/admin" 
                      onClick={() => setShowUserMenu(false)}
                      className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                      role="menuitem"
                    >
                      <Cog8ToothIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      Dashboard Admin
                    </a>
                  )}

                  {/* Terminar Sessão */}
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                      role="menuitem"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      Terminar Sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <a href="/login" className='text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-green-500'>
                Login
              </a>
              <a href="/register" className='bg-green-600 hover:bg-green-700 duration-150 ease-in-out text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-700'>
                Registre-se
              </a>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};