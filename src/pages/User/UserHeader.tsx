import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import "../../styles.css";
import { MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';
import CreateTaskModal from '../../features/tasksCreation/createTaskModal'; // Import do modal

// Interface para o objeto Vizinhanca aninhado
interface VizinhancaData {
  idVizinhanca: number;
  nomeFreguesia: string;
}

// Interface UserDataFromAPI atualizada
interface UserDataFromAPI {
  idUtilizador: number;
  nomeUtilizador: string;
  emailUtilizador?: string;
  dataNascimento?: string;
  pontos?: number;
  comprovativoResidencia?: string;
  utilizadorLogin?: string;
  Vizinhanca?: VizinhancaData;
}

interface UserHeaderProps {
  onTaskCreated?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ onTaskCreated }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDataFromAPI | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estados para modal
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const handleOpenCreateTaskModal = () => setIsCreateTaskModalOpen(true);
  const handleCloseCreateTaskModal = () => setIsCreateTaskModalOpen(false);

  const handleTaskSuccessfullyCreated = useCallback((newTask: any) => {
    console.log('Nova tarefa criada no UserHeader:', newTask);
    if (onTaskCreated) onTaskCreated();
    handleCloseCreateTaskModal();
  }, [onTaskCreated]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      const localToken = Cookies.get('jwt');

      if (localToken) {
        try {
          const response = await axios.get('http://localhost:3000/api/users/profile', {
            headers: { Authorization: `Bearer ${localToken}` },
          });

          if (response.data && response.data.user) {
            const userDataFromApi = response.data.user as UserDataFromAPI;
            if (userDataFromApi.nomeUtilizador) {
              setCurrentUser(userDataFromApi);
            } else {
              console.warn("UserHeader: 'nomeUtilizador' não encontrado.");
              setCurrentUser(null);
            }
          } else {
            console.warn("UserHeader: Estrutura inesperada de resposta.");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("UserHeader: Erro ao buscar dados do usuário:", error);
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              Cookies.remove('jwt');
              // window.location.href = '/login'; // opcional
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

  const handleLogout = () => {
    Cookies.remove('jwt');
    if (typeof window !== 'undefined') window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header className='bg-white shadow-sm h-20 w-full font-[Inter] flex justify-between px-6 sm:px-12 md:px-24 items-center sticky top-0 z-50'>
        <div className='flex items-center'>
          <a href="/tasksCreated" className='flex items-center'>
            <img src="/icon.png" alt="NextDoor Logo" className='w-[40px] h-[40px]' />
            <h1 className='font-bold text-[#5A5A5A] text-xl ml-2 hidden sm:block hover:text-black'>NextDoor</h1>
          </a>
          {currentUser && currentUser.Vizinhanca && (
            <div className="ml-4 pl-4 border-l border-gray-300 hidden md:flex items-center">
              <MapPinIcon className="h-5 w-5 text-green-600 mr-1.5" />
              <span className="text-sm text-gray-600 font-medium">{currentUser.Vizinhanca.nomeFreguesia}</span>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-6 md:space-x-8'>
          <ul className='flex space-x-4 items-center text-[#5A5A5A] text-sm sm:text-base'>
            <li><a href="/user-product" className='hover:text-black'><strong>Produtos</strong></a></li>
            <li><a href="/tasksCreated" className='hover:text-black'><strong>Tarefas</strong></a></li>
            <li>
              <button
                onClick={handleOpenCreateTaskModal}
                className="ml-2 bg-[#4CAF4F] hover:bg-[#3e8e41] text-white font-semibold px-4 py-2 rounded-md shadow-md transition duration-150 ease-in-out"
              >
                Criar Tarefa
              </button>
            </li>
          </ul>

          {isLoadingUser ? (
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-md"></div>
          ) : currentUser ? (
            <div className="flex items-center space-x-3 relative" ref={menuRef}>
              <span className="text-gray-700 text-sm font-medium hidden md:block">{currentUser.nomeUtilizador}</span>
              <button
                onClick={handleMenuToggle}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                aria-label="Menu do usuário"
              >
                <img src="/man.png" alt="Perfil" className="w-8 h-8 rounded-full object-cover" />
              </button>
              {showUserMenu && (
                <div className="origin-top-right absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md w-52  py-1 ring-1 ring-black ring-opacity-5 z-20 animate-modalFadeInScale">
                  <a
                    href="/usercodes"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <TicketIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Meus Resgates
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Terminar Sessão
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex items-center space-x-3'>
              <a href="/login" className='text-[#5A5A5A] hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors'>Login</a>
              <a href="/register" className='bg-[#4CAF4F] hover:bg-[#439A45] duration-150 ease-in-out text-white px-4 py-2.5 rounded-md text-sm font-light'>Registre-se</a>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Criação de Tarefa */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        onTaskCreated={handleTaskSuccessfullyCreated}
      />
    </>
  );
};
