import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { Sidebar } from '../Sidebar'; // Ajustado para um caminho mais comum
import { DashboardHeader } from '../DashboardHeader'; // Ajustado
import {
    TicketIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    UserCircleIcon,
    BuildingStorefrontIcon as EstablishmentIcon,
    MapPinIcon,
    CurrencyDollarIcon, // Renomeado para clareza, se for pontos
    InformationCircleIcon,
    XMarkIcon,
    PhotoIcon,
    ChevronLeftIcon, // Para paginação
    ChevronRightIcon, // Para paginação
    ClipboardDocumentIcon // Para copiar
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 8; // Ajuste conforme necessário

// --- Interfaces ---
interface VizinhancaInfo {
    idVizinhanca: number;
    nomeFreguesia: string;
}

interface EstabelecimentoDetails {
    idEstabelecimento: number;
    nomeEstabelecimento: string;
    Vizinhanca?: VizinhancaInfo;
}

interface ProdutoInfo {
  idProduto: number;
  nomeProduto: string;
  imagemProduto?: string;
  precoProduto: number; // Pontos do produto no momento do resgate
  descricaoProduto?: string;
  Estabelecimento?: EstabelecimentoDetails;
}

interface EstadoResgateInfo {
  idEstadoResgate: number;
  estadoResgate: string;
}

interface UtilizadorInfo {
    idUtilizador: number;
    nomeUtilizador: string;
    emailUtilizador: string;
    Vizinhanca?: VizinhancaInfo;
}

interface AdminRedemptionCode {
  idResgate: number; // Ou idResgateCodigo, confirme o nome da PK
  codigo: string;
  dataResgate: string;
  pontosProduto?: number; // Pontos efetivamente gastos (pode ser diferente de Produto.precoProduto se o preço mudar)

  Produto?: ProdutoInfo;
  Utilizador?: UtilizadorInfo; // Nome do modelo 'Utilizador' ou alias da associação
  EstadoResgate?: EstadoResgateInfo; // Nome do modelo 'EstadoResgate' ou alias da associação
}

interface GetAllRedemptionCodesResponse {
  // message?: string; // Removido se não usado
  redemptionCodes: AdminRedemptionCode[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const AdminRedemptionCodes: React.FC = () => {
  const [codes, setCodes] = useState<AdminRedemptionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedCode, setSelectedCode] = useState<AdminRedemptionCode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');


  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    // Não resetar o erro aqui permite que ele persista até uma nova tentativa bem sucedida
    // setError(null); 
    const token = Cookies.get('jwt');

    if (!token) {
      setError('Administrador não autenticado.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get<GetAllRedemptionCodesResponse>(`http://localhost:3000/api/redemptionCodes/all`, { // Rota /all para admin
        headers: { Authorization: `Bearer ${token}` },
        params: { page: page, limit: ITEMS_PER_PAGE }
      });
      setCodes(response.data.redemptionCodes || []);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 0);
      setTotalItems(response.data.totalItems || 0);
      setError(null); 
    } catch (err) {
      console.error("AdminRedemptionCodes: Erro ao buscar códigos:", err);
      const axiosError = err as AxiosError<any>;
      let errorMsg = 'Falha ao carregar todos os códigos de resgate.';
      if (axiosError.response?.data?.error) {
        errorMsg = axiosError.response.data.error;
      } else if (axiosError.message) {
        errorMsg = axiosError.message;
      }
      setError(errorMsg);
      setCodes([]); 
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
        setCurrentPage(newPage);
    }
  };

  // Lógica de renderização de botões de paginação (similar ao AdminProduct)
  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages === 0) return pageNumbers;
    const maxPagesToShow = 5; 
    let startPage: number, endPage: number;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor((maxPagesToShow -1) / 2);
        const maxPagesAfterCurrent = Math.ceil((maxPagesToShow-1) / 2) -1; 
        if (currentPage <= maxPagesBeforeCurrent +1 ) {
            startPage = 1;
            endPage = maxPagesToShow -1;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - (maxPagesToShow - 2);
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }
    
    if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
            pageNumbers.push('...');
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if ( i === 0 ) continue; 
        pageNumbers.push(i);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }
    return [...new Set(pageNumbers)]; 
  };

  const openDetailsModal = (code: AdminRedemptionCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
    setCopySuccess('');
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedCode(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(`Código "${text}" copiado!`);
        setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
        console.error('Erro ao copiar código:', err);
        setCopySuccess('Falha ao copiar.');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (isLoading && codes.length === 0) { 
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-gray-500">A carregar códigos de resgate...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Todos os Códigos de Resgate</h1>
            {isLoading && <span className="text-sm text-gray-500">A atualizar...</span>}
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md relative flex items-center" role="alert">
                <InformationCircleIcon className="h-5 w-5 mr-2"/>
                <span className="block sm:inline">{error}</span>
            </div>
          )}


          {codes.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Resgate</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codes.map((code) => (
                    <tr key={code.idResgate} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{code.codigo}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          {code.Produto?.imagemProduto && (code.Produto.imagemProduto.startsWith('http://') || code.Produto.imagemProduto.startsWith('https://')) ? (
                            <img src={code.Produto.imagemProduto} alt={code.Produto.nomeProduto} className="h-10 w-10 rounded-md object-cover mr-3 flex-shrink-0"/>
                          ) : (
                            <PhotoIcon className="h-10 w-10 text-gray-300 mr-3 flex-shrink-0"/>
                          )}
                          <span className="truncate" title={code.Produto?.nomeProduto}>{code.Produto?.nomeProduto || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2 flex-shrink-0"/>
                            <div>
                                <div className="truncate" title={code.Utilizador?.nomeUtilizador}>{code.Utilizador?.nomeUtilizador || 'N/A'}</div>
                                <div className="text-xs text-gray-400 truncate" title={code.Utilizador?.emailUtilizador}>{code.Utilizador?.emailUtilizador}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(code.dataResgate)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            code.EstadoResgate?.estadoResgate === 'Utilizado' ? 'bg-green-100 text-green-800' :
                            code.EstadoResgate?.estadoResgate === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                            code.EstadoResgate?.estadoResgate === 'Expirado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                          {code.EstadoResgate?.estadoResgate || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailsModal(code)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !isLoading && !error && ( 
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum código de resgate encontrado.</h3>
                <p className="mt-2 text-gray-500">Ainda não foram gerados códigos de resgate no sistema.</p>
                </div>
            )
          )}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg shadow-sm">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        A mostrar <span className="font-medium">{Math.max(1, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span>
                        {' '}a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span>
                        {' '}de <span className="font-medium">{totalItems}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          aria-label="Página Anterior"
                        >
                          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {renderPageNumbers().map((page, index) =>
                            typeof page === 'number' ? (
                                <button
                                    key={`page-${page}`}
                                    onClick={() => handlePageChange(page)}
                                    disabled={isLoading}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        currentPage === page
                                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                ...
                                </span>
                            )
                        )}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || isLoading}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          aria-label="Próxima Página"
                        >
                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
            )}
        </main>
      </div>

      {/* Modal de Detalhes do Resgate */}
      {isModalOpen && selectedCode && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl mx-auto animate-slideUpModal">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Resgate</h3>
                <button
                    onClick={() => copyToClipboard(selectedCode.codigo)}
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center group"
                    title="Copiar código"
                >
                    <span className="font-mono group-hover:underline">{selectedCode.codigo}</span>
                    <ClipboardDocumentIcon className="h-4 w-4 ml-2 transition-transform group-hover:scale-110"/>
                </button>
                {copySuccess && <span className="ml-2 text-xs text-green-600 animate-pulse">{copySuccess}</span>}
              </div>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <section className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><PhotoIcon className="h-5 w-5 mr-2 text-gray-500"/>Produto Resgatado</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        {selectedCode.Produto?.imagemProduto && (selectedCode.Produto.imagemProduto.startsWith('http://') || selectedCode.Produto.imagemProduto.startsWith('https://')) ? (
                            <img src={selectedCode.Produto.imagemProduto} alt={selectedCode.Produto.nomeProduto} className="h-28 w-28 rounded-md object-cover border"/>
                        ) : (
                            <div className="h-28 w-28 bg-gray-200 rounded-md flex items-center justify-center text-gray-400"><PhotoIcon className="h-12 w-12"/></div>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <p><span className="font-medium text-gray-600">ID do Produto:</span> {selectedCode.Produto?.idProduto || 'N/A'}</p>
                        <p><span className="font-medium text-gray-600">Nome:</span> {selectedCode.Produto?.nomeProduto || 'N/A'}</p>
                        <p className="flex items-start"><CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0"/><span className="font-medium text-gray-600">Pontos no Resgate:</span> <span className="text-gray-700 ml-1">{selectedCode.pontosProduto ?? selectedCode.Produto?.precoProduto ?? 'N/A'}</span></p>
                        <p className="flex items-start"><InformationCircleIcon className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0"/><span className="font-medium text-gray-600">Descrição:</span> <span className="text-gray-700 ml-1 break-words">{selectedCode.Produto?.descricaoProduto || 'N/A'}</span></p>
                    </div>
                </div>
              </section>

              {selectedCode.Produto?.Estabelecimento && (
                <section className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><EstablishmentIcon className="h-5 w-5 mr-2 text-gray-500"/>Estabelecimento</h4>
                    <p><span className="font-medium text-gray-600">ID:</span> {selectedCode.Produto.Estabelecimento.idEstabelecimento || 'N/A'}</p>
                    <p><span className="font-medium text-gray-600">Nome:</span> {selectedCode.Produto.Estabelecimento.nomeEstabelecimento || 'N/A'}</p>
                    {selectedCode.Produto.Estabelecimento.Vizinhanca && (
                        <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Vizinhança:</span> <span className="text-gray-700 ml-1">{selectedCode.Produto.Estabelecimento.Vizinhanca.nomeFreguesia || 'N/A'}</span></p>
                    )}
                </section>
              )}

              <section className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-gray-500"/>Utilizador</h4>
                <p><span className="font-medium text-gray-600">ID:</span> {selectedCode.Utilizador?.idUtilizador || 'N/A'}</p>
                <p><span className="font-medium text-gray-600">Nome:</span> {selectedCode.Utilizador?.nomeUtilizador || 'N/A'}</p>
                <p><span className="font-medium text-gray-600">Email:</span> {selectedCode.Utilizador?.emailUtilizador || 'N/A'}</p>
                {selectedCode.Utilizador?.Vizinhanca && ( 
                     <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Vizinhança:</span> <span className="text-gray-700 ml-1">{selectedCode.Utilizador.Vizinhanca.nomeFreguesia || 'N/A'}</span></p>
                )}
              </section>

              <section>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><TicketIcon className="h-5 w-5 mr-2 text-gray-500"/>Detalhes do Resgate</h4>
                <p className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Data:</span> <span className="text-gray-700 ml-1">{formatDate(selectedCode.dataResgate)}</span></p>
                {selectedCode.EstadoResgate && ( 
                    <p className="flex items-center"><CheckBadgeIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Estado:</span> <span className="text-gray-700 ml-1">{selectedCode.EstadoResgate.estadoResgate}</span></p>
                )}
              </section>
            </div>

            <div className="mt-8 text-right">
              <button onClick={closeDetailsModal} className="btn-secondary px-4 py-2">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};