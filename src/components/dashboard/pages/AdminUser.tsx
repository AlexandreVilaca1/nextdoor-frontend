// src/components/AdminUsers.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';
import {
  UsersIcon, // Para o título
  EyeIcon,   // Para "Ver Mais"
  // TrashIcon, // Para "Remover" se você reativar
  XMarkIcon, // Para fechar o modal
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon // Para mensagens
} from '@heroicons/react/24/outline';

const token = Cookies.get('jwt');

interface User {
  idUtilizador: number; // Corrigido para idUtilizador para consistência com o backend
  nomeUtilizador: string;
  dataNascimento: string;
  pontosUtilizador: number;
  comprovativoResidencia: string;
  emailUtilizador: string;
  // password não deve ser buscada ou exibida
  EnderecoidEndereco: number;
  VizinhancaidVizinhanca: number; // Corrigido para V maiúsculo
  estadoUtilizadoridEstadoUtilizador: number;
  tipoUtilizadoridTipoUtilizador: number;
  // Se o backend puder incluir os nomes, seria ótimo:
  // TipoUtilizador?: { nomeTipoUtilizador: string };
  // EstadoUtilizador?: { nomeEstado: string };
  // Vizinhanca?: { nomeFreguesia: string };
}


export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false); // Renomeado para clareza
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Mantido, mas pode ser ajustado
  const [totalItems, setTotalItems] = useState(0); // Para buscar do backend
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // Para feedback

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]); 

  const fetchUsers = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await axios.get('http://localhost:3000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: itemsPerPage }
      });
      setUsers(Array.isArray(res.data.users) ? res.data.users : (Array.isArray(res.data.user) ? res.data.user : []));
      setTotalItems(res.data.totalItems || (Array.isArray(res.data.users) ? res.data.users.length : (Array.isArray(res.data.user) ? res.data.user.length : 0) )); 
    } catch (err) {
      console.error('Erro ao buscar utilizadores:', err);
      setMessage('Erro ao buscar utilizadores.');
      setUsers([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  /*
  const handleRemoveUser = async (userId: number) => {
    if (!window.confirm("Tem certeza que deseja remover este utilizador?")) return;
    try {
      // Ajuste o endpoint se necessário
      await axios.delete(`http://localhost:3000/api/users/${userId}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Utilizador removido com sucesso.');
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao remover utilizador:', err);
      setMessage('Erro ao remover utilizador.');
    }
  };
  */

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedUser(null); 
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };
  
  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5; 
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        if (totalPages > 0) pageNumbers.push(1); 
        if (currentPage > halfPagesToShow + 2) {
            if (currentPage - halfPagesToShow > 2) { 
                 pageNumbers.push('...');
            }
        }
        let startPage = Math.max(2, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
        if (currentPage <= halfPagesToShow + 1) {
            endPage = Math.min(totalPages - 1, maxPagesToShow);
        } else if (currentPage >= totalPages - halfPagesToShow) {
            startPage = Math.max(2, totalPages - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            if (i > 0 && i <= totalPages) pageNumbers.push(i); // Garantir que i seja válido
        }
        if (currentPage < totalPages - halfPagesToShow - 1) {
            if (currentPage + halfPagesToShow < totalPages -1) { 
                pageNumbers.push('...'); 
            }
        }
        if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
            pageNumbers.push(totalPages);
        }
    }
    return pageNumbers.filter((item, index, self) => {
        if (item === '...') { return index === 0 || self[index - 1] !== '...'; }
        return self.findIndex(it => it === item) === index; 
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-indigo-600" />
              Gestão de Utilizadores
            </h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 text-center rounded-md shadow text-sm flex items-center justify-center gap-2 ${message.toLowerCase().includes('erro') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              <InformationCircleIcon className="h-5 w-5" />
              <span>{message}</span>
            </div>
          )}
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pontos</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && users.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                            <div className="flex justify-center items-center">
                                <svg className="animate-spin h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                A carregar utilizadores...
                            </div>
                        </td>
                    </tr>
                  ) : !isLoading && users.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                            Nenhum utilizador encontrado.
                        </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.idUtilizador} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nomeUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.emailUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.pontosUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.tipoUtilizadoridTipoUtilizador === 1 ? 'Admin' : 'Vizinho'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleViewDetails(user)} 
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-md hover:bg-indigo-100"
                            title="Ver Detalhes"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* 
                          <button 
                            onClick={() => handleRemoveUser(user.idUtilizador)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-100"
                            title="Remover Utilizador"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button> 
                          */}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && !isLoading && (
            <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página Anterior"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-600"/>
                </button>
                
                {renderPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${currentPage === page
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="px-1.5 py-1.5 text-sm text-gray-500">...</span>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima Página"
                >
                    <ChevronRightIcon className="h-6 w-6 text-gray-600"/>
                </button>
            </div>
          )}
        </main>

        {isDetailsModalVisible && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={handleCloseDetailsModal}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 mb-5 border-b">
                <h3 className="text-xl font-semibold text-indigo-700">Detalhes do Utilizador</h3>
                <button onClick={handleCloseDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <p><strong className="font-medium text-gray-600 w-36 inline-block">Nome:</strong> {selectedUser.nomeUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">Email:</strong> {selectedUser.emailUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">Data de Nascimento:</strong> {new Date(selectedUser.dataNascimento).toLocaleDateString()}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">Pontos:</strong> {selectedUser.pontosUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">Comp. Residência:</strong> {selectedUser.comprovativoResidencia || 'N/A'}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">ID Endereço:</strong> {selectedUser.EnderecoidEndereco}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">ID Vizinhança:</strong> {selectedUser.VizinhancaidVizinhanca}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">ID Estado User:</strong> {selectedUser.estadoUtilizadoridEstadoUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-36 inline-block">ID Tipo User:</strong> {selectedUser.tipoUtilizadoridTipoUtilizador}</p>
              </div>
              <div className="mt-8 pt-5 border-t flex justify-end">
                <button className="btn-secondary" onClick={handleCloseDetailsModal}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};