import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader'; 
import Cookies from 'js-cookie';
import {
  UsersIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BackspaceIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import "../../../styles.css"; 

const token = Cookies.get('jwt');

interface VizinhançaInfo {
  idVizinhanca: number;
  nomeFreguesia: string;
}

interface FetchVizinhançasApiResponse {
  message: string;
  neighborhood: VizinhançaInfo[];
}

interface EnderecoInfo { 
  idEndereco: number;
  numeroPorta: string; 
  distrito: string;
  freguesia: string;
  codigoPostal: string;
  rua: string;
}

interface User {
  idUtilizador: number;
  nomeUtilizador: string;
  dataNascimento: string;
  pontosUtilizador: number;
  comprovativoResidencia?: string | null;
  emailUtilizador: string;
  estadoUtilizadoridEstadoUtilizador: number;
  tipoUtilizadoridTipoUtilizador: number;
  Vizinhanca?: VizinhançaInfo | null;  
  Endereco?: EnderecoInfo | null;     
}

// Interface para a resposta da API de Utilizadores
interface FetchUsersResponse {
  users?: User[];
  user?: User[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  message?: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVizinhança, setSelectedVizinhança] = useState<string>('');
  const [vizinhançasList, setVizinhançasList] = useState<VizinhançaInfo[]>([]);
  const [isLoadingVizinhanças, setIsLoadingVizinhanças] = useState(false);
  const [selectedTipoUtilizador, setSelectedTipoUtilizador] = useState<string>('');

  const fetchVizinhanças = useCallback(async () => {
    if (!token) return;
    setIsLoadingVizinhanças(true);
    try {
      const response = await axios.get<FetchVizinhançasApiResponse>(
        'http://localhost:3000/api/neighborhoods',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.neighborhood && Array.isArray(response.data.neighborhood)) {
        setVizinhançasList(response.data.neighborhood);
      } else {
        console.warn("Dados de vizinhanças (response.data.neighborhood) não encontrados ou não são um array:", response.data);
        setVizinhançasList([]);
      }
    } catch (err) {
      console.error('Erro ao buscar vizinhanças:', err);
      setVizinhançasList([]);
    } finally {
      setIsLoadingVizinhanças(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVizinhanças();
  }, [fetchVizinhanças]);

  const fetchUsers = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    if (!token) {
      setError('Administrador não autenticado. Por favor, faça login.');
      setIsLoading(false);
      return;
    }

    const params: any = { page, limit };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedVizinhança) params.vizinhancaId = selectedVizinhança;
    if (selectedTipoUtilizador) params.tipoId = selectedTipoUtilizador;
    
    try {
      const response = await axios.get<FetchUsersResponse>(
        'http://localhost:3000/api/users/all',
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (response.data) {
        const usersList = response.data.users || response.data.user || [];
        setUsers(usersList);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.currentPage || page);
      } else {
        throw new Error("Resposta da API inválida ao buscar utilizadores.");
      }
    } catch (err) {
      console.error('Erro ao buscar utilizadores:', err);
      const axiosError = err as AxiosError<any>;
      if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error);
      } else if (axiosError.request) {
        setError("Erro de rede: Não foi possível conectar ao servidor.");
      } else {
        setError('Falha ao buscar utilizadores. Tente novamente mais tarde.');
      }
      setUsers([]); setTotalItems(0); setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, searchTerm, selectedVizinhança, selectedTipoUtilizador]);

  useEffect(() => {
    if (!isLoadingVizinhanças) {
        fetchUsers(currentPage, itemsPerPage);
    }
  }, [currentPage, itemsPerPage, fetchUsers, isLoadingVizinhanças]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleVizinhançaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVizinhança(event.target.value);
    setCurrentPage(1);
  };

  const handleTipoUtilizadorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipoUtilizador(event.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedVizinhança('');
    setSelectedTipoUtilizador('');
    setCurrentPage(1);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedUser(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages === 0) return pageNumbers;
    const maxVisiblePageButtons = 3;
    const pagesAroundCurrent = Math.floor(maxVisiblePageButtons / 2);
    if (totalPages > 0) pageNumbers.push(1);
    if (currentPage - pagesAroundCurrent > 2 && totalPages > maxVisiblePageButtons + 2) pageNumbers.push('...');
    let startLoop = Math.max(2, currentPage - pagesAroundCurrent);
    let endLoop = Math.min(totalPages - 1, currentPage + pagesAroundCurrent);
    if (currentPage <= pagesAroundCurrent +1 && totalPages > 1) endLoop = Math.min(totalPages - 1, maxVisiblePageButtons);
    if (currentPage >= totalPages - pagesAroundCurrent && totalPages > 1) startLoop = Math.max(2, totalPages - maxVisiblePageButtons +1) ;
    for (let i = startLoop; i <= endLoop; i++) { if (i > 1 && i < totalPages) pageNumbers.push(i); }
    if (currentPage + pagesAroundCurrent < totalPages - 1 && totalPages > maxVisiblePageButtons + 2) pageNumbers.push('...');
    if (totalPages > 1) pageNumbers.push(totalPages);
    return [...new Set(pageNumbers)];
  };

  const formatBirthDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('pt-PT'); }
    catch (e) { return 'Data Inválida'; }
  };

  const getTipoUtilizadorNome = (tipoId: number): string => {
    switch (tipoId) {
      case 1: return 'Administrador';
      case 2: return 'Vizinho';
      default: return `ID: ${tipoId}`;
    }
  };

  const getEstadoUtilizadorNome = (estadoId: number): string => {
    switch (estadoId) {
      case 1: return 'Online';
      case 2: return 'Offline';
      case 3: return 'A realizar tarefa';
      case 4: return 'A não realizar tarefa';
      default: return `ID: ${estadoId}`;
    }
  };

  const getNomeVizinhançaUtilizador = (vizinhancaObj?: VizinhançaInfo | null): string => {
    if (vizinhancaObj && vizinhancaObj.nomeFreguesia) {
      return vizinhancaObj.nomeFreguesia;
    }
    return 'N/A';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <DashboardHeader />
        <main className="p-4 sm:p-6 xl:p-8 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-indigo-600" />
              Gestão de Utilizadores
            </h2>
          </div>

          <div className="mb-8 p-4 sm:p-6 bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="flex items-center mb-5 pb-3 border-b border-gray-200">
                <FunnelIcon className="h-6 w-6 mr-3 text-indigo-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
                    Filtrar Utilizadores
                </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 items-end">
              <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pesquisar por Nome ou Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input-style w-full pl-10 py-2.5" 
                    placeholder="       Ex: João Silva, joao@email.com" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="vizinhança" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vizinhança
                </label>
                <select
                  id="vizinhança"
                  className="select-style w-full py-2.5" 
                  value={selectedVizinhança}
                  onChange={handleVizinhançaChange}
                  disabled={isLoadingVizinhanças || vizinhançasList.length === 0}
                >
                  <option value="">Todas as Vizinhanças</option>
                  {isLoadingVizinhanças ? (
                    <option value="" disabled>A carregar...</option>
                  ) : (
                    vizinhançasList.map(v => (
                      <option key={v.idVizinhanca} value={v.idVizinhanca.toString()}>
                        {v.nomeFreguesia}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="tipoUtilizador" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de Utilizador
                </label>
                <select
                  id="tipoUtilizador"
                  className="select-style w-full py-2.5"
                  value={selectedTipoUtilizador}
                  onChange={handleTipoUtilizadorChange}
                >
                  <option value="">Todos os Tipos</option>
                  <option value="1">Administrador</option>
                  <option value="2">Vizinho</option>
                </select>
              </div>
              <div className="lg:mt-0 mt-4">
                 <button
                  onClick={handleClearFilters}
                  className="btn-secondary w-full flex items-center justify-center py-2.5" 
                >
                  <BackspaceIcon className="h-5 w-5 mr-2" />
                  Limpar Filtros
                </button>
               </div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pontos</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vizinhança</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && users.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500"><div className="flex justify-center items-center"><svg className="animate-spin h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>A carregar utilizadores...</div></td></tr>
                  ) : !isLoading && users.length === 0 && !error ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Nenhum utilizador encontrado com os filtros aplicados.</td></tr>
                  ) : error && users.length === 0 && !isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-red-600 font-medium">{error}</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.idUtilizador} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nomeUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.emailUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{user.pontosUtilizador}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getNomeVizinhançaUtilizador(user.Vizinhanca)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.tipoUtilizadoridTipoUtilizador === 1 ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {getTipoUtilizadorNome(user.tipoUtilizadoridTipoUtilizador)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button onClick={() => handleViewDetails(user)} className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Ver Detalhes"><EyeIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 0 && !isLoading && users.length > 0 && (
             <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 bg-white px-4 py-3 border-t border-gray-200 rounded-b-lg shadow-md">
              <div className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                <span className="hidden md:inline"> ({totalItems} utilizadores)</span>
              </div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1 || isLoading} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Primeira Página"> <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" /> </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Página Anterior"> <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" /> </button>
                {renderPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button key={`page-${page}`} onClick={() => handlePageChange(page)} disabled={isLoading} aria-current={currentPage === page ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'} disabled:opacity-60 disabled:cursor-not-allowed`}> {page} </button>
                  ) : ( <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span> )
                )}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Próxima Página"> <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || isLoading} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Última Página"> <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" /> </button>
              </nav>
            </div>
          )}
           {error && users.length === 0 && !isLoading && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md shadow-md text-center">
              <InformationCircleIcon className="h-6 w-6 inline mr-2" />
              {error}
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
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Nome:</strong> {selectedUser.nomeUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Email:</strong> {selectedUser.emailUtilizador}</p>
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Data Nasc.:</strong> {formatBirthDate(selectedUser.dataNascimento)}</p>
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Pontos:</strong> {selectedUser.pontosUtilizador}</p>
                <p className="flex items-start">
                    <strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Comp. Resid.:</strong>
                    <span className="break-all">{selectedUser.comprovativoResidencia || 'N/A'}</span>
                </p>
                
                {/* --- Exibição dos Detalhes do Endereço --- */}
                {selectedUser.Endereco ? (
                  <>
                    <p className="pt-2 mt-2 border-t border-gray-200"> 
                        <strong className="font-semibold text-gray-700 block mb-1">Endereço Principal:</strong>
                    </p>
                    <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Rua:</strong> {selectedUser.Endereco.rua || 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Nº Porta:</strong> {selectedUser.Endereco.numeroPorta || 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Cód. Postal:</strong> {selectedUser.Endereco.codigoPostal || 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Freguesia:</strong> {selectedUser.Endereco.freguesia || 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Distrito:</strong> {selectedUser.Endereco.distrito || 'N/A'}</p>
                  </>
                ) : (
                  <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Endereço:</strong> N/A</p>
                )}
                {/* ------------------------------------------- */}

                <p className="pt-2 mt-2 border-t border-gray-200"><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Vizinhança:</strong>
                  {getNomeVizinhançaUtilizador(selectedUser.Vizinhanca)}
                </p>
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Tipo:</strong> {getTipoUtilizadorNome(selectedUser.tipoUtilizadoridTipoUtilizador)}</p>
                <p><strong className="font-medium text-gray-600 w-32 inline-block shrink-0">Estado:</strong> {getEstadoUtilizadorNome(selectedUser.estadoUtilizadoridEstadoUtilizador)}</p>

              </div>
              <div className="mt-8 pt-5 border-t flex justify-end">
                <button className="btn-secondary" onClick={handleCloseDetailsModal}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};