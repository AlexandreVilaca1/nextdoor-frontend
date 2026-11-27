import { API_URL } from "../../../config/api";
import React, { useEffect, useState, useCallback } from 'react'; 
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import {
    TicketIcon, CalendarDaysIcon, CheckBadgeIcon, UserCircleIcon,
    BuildingStorefrontIcon as EstablishmentIcon, MapPinIcon, CurrencyDollarIcon,
    InformationCircleIcon, XMarkIcon, PhotoIcon, ChevronLeftIcon,
    ChevronRightIcon, ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import "../../../styles.css"; 

const ITEMS_PER_PAGE = 6;

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
  precoProduto: number;
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
  idResgate: number; 
  codigo: string;
  dataResgate: string;
  pontosProduto?: number;
  Produto?: ProdutoInfo;
  Utilizador?: UtilizadorInfo;
  EstadoResgate?: EstadoResgateInfo;
}
interface GetAllRedemptionCodesResponse {
  redemptionCodes: AdminRedemptionCode[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
interface EstabelecimentoLista { idEstabelecimento: number; nomeEstabelecimento: string; }
interface ProdutoLista { idProduto: number; nomeProduto: string; }
interface EstadoResgateOption { idEstadoResgate: number; estadoResgate: string; }


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

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [allEstadosResgate, setAllEstadosResgate] = useState<EstadoResgateOption[]>([]);
  const [selectedEstadoFiltro, setSelectedEstadoFiltro] = useState<string>('');
  const [allEstabelecimentos, setAllEstabelecimentos] = useState<EstabelecimentoLista[]>([]);
  const [selectedEstabelecimentoFiltro, setSelectedEstabelecimentoFiltro] = useState<string>('');
  const [allProdutos, setAllProdutos] = useState<ProdutoLista[]>([]);
  const [selectedProdutoFiltro, setSelectedProdutoFiltro] = useState<string>('');

  const token = Cookies.get('jwt');

  const getFullImageUrl = useCallback((imagePath?: string): string | null => {
    if (!imagePath || imagePath.trim() === "") return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_URL}${imagePath}`;
  }, []);


  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return 'Data inválida'; }
  };

  const handleApiError = useCallback((err: any, defaultMessage: string) => {
    console.error("API Error (AdminRedemptionCodes):", defaultMessage, err.response?.data || err.message || err);
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;
      if (axiosError.response?.data?.error) errorMessage = axiosError.response.data.error;
      else if (axiosError.request) errorMessage = "Erro de rede: O servidor não respondeu.";
      else if (axiosError.message) errorMessage = axiosError.message;
    } else if (err instanceof Error) { errorMessage = err.message; }
    setError(errorMessage);
  }, []);

  const fetchData = useCallback(async (
    pageToFetch = 1,
    currentSearchTerm = debouncedSearchTerm,
    currentEstado = selectedEstadoFiltro,
    currentEstab = selectedEstabelecimentoFiltro,
    currentProd = selectedProdutoFiltro
  ) => {
    setIsLoading(true);
    if (!token) { setError('Administrador não autenticado.'); setIsLoading(false); return; }

    try {
      const params: Record<string, any> = {
        page: pageToFetch, limit: ITEMS_PER_PAGE,
        searchTerm: currentSearchTerm.trim() || undefined,
        estadoResgateId: currentEstado || undefined,
        estabelecimentoId: currentEstab || undefined,
        produtoId: currentProd || undefined,
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get<GetAllRedemptionCodesResponse>(
        `${API_URL}/api/redemptionCodes/all`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );
      setCodes(response.data.redemptionCodes || []);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 0);
      setTotalItems(response.data.totalItems || 0);
      setError(null);
    } catch (err) {
      handleApiError(err, 'Falha ao carregar códigos de resgate.');
      setCodes([]); setTotalPages(0); setTotalItems(0); 
    } finally {
      setIsLoading(false);
    }
  }, [token, debouncedSearchTerm, selectedEstadoFiltro, selectedEstabelecimentoFiltro, selectedProdutoFiltro, handleApiError]);

  useEffect(() => {
    const fetchFilterLists = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [estadosRes, estabRes, produtosRes] = await Promise.all([
          axios.get<{ redemptionStatus: EstadoResgateOption[] }>(`${API_URL}/api/redemptionCodes/status`, config),
          axios.get<{ establishments: EstabelecimentoLista[] }>(`${API_URL}/api/establishments/all/list`, config), 
          axios.get<{ products: ProdutoLista[] }>(`${API_URL}/api/products/all/list`, config) 
        ]);
        setAllEstadosResgate(estadosRes.data.redemptionStatus || []);
        setAllEstabelecimentos(estabRes.data.establishments || []);
        setAllProdutos(produtosRes.data.products || []);
      } catch (err) {
        console.error("Erro ao buscar listas para filtros:", err);
      }
    };
    fetchFilterLists();
  }, [token]);

  // Debounce para o campo de pesquisa
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); 
    }, 500); 
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(currentPage, debouncedSearchTerm, selectedEstadoFiltro, selectedEstabelecimentoFiltro, selectedProdutoFiltro);
  }, [currentPage, debouncedSearchTerm, selectedEstadoFiltro, selectedEstabelecimentoFiltro, selectedProdutoFiltro, fetchData]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 1) return pageNumbers;
    const maxPagesToShow = 5;
    let startPage: number, endPage: number;

    if (totalPages <= maxPagesToShow) {
        startPage = 1; endPage = totalPages;
    } else {
        const maxPagesSide = Math.floor((maxPagesToShow - 3) / 2);
        if (currentPage <= maxPagesSide + 1) {
            startPage = 1; endPage = maxPagesToShow - 2 < 1 ? 1 : maxPagesToShow - 2 ; 
        } else if (currentPage >= totalPages - maxPagesSide) {
            startPage = totalPages - (maxPagesToShow - 3) > totalPages ? totalPages : totalPages - (maxPagesToShow - 3); endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesSide; endPage = currentPage + maxPagesSide;
        }
        startPage = Math.max(1, startPage);
        endPage = Math.min(totalPages, endPage);
    }
    
    if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
    }
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };


  const openDetailsModal = (code: AdminRedemptionCode) => { setSelectedCode(code); setIsModalOpen(true); setCopySuccess(''); };
  const closeDetailsModal = () => { setIsModalOpen(false); setSelectedCode(null); };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(`Código "${text}" copiado!`); setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => { console.error('Erro ao copiar código:', err); setCopySuccess('Falha ao copiar.'); setTimeout(() => setCopySuccess(''), 2000); });
  };

  if (isLoading && codes.length === 0 && !error) {
    return ( <div className="flex min-h-screen bg-gray-100"> <Sidebar /> <div className="flex-1 flex flex-col"> <DashboardHeader /> <div className="flex-1 flex items-center justify-center py-10"> <div className="text-center"> <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle> <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path> </svg> <p className="text-xl text-gray-600">A carregar códigos...</p> </div> </div> </div> </div> );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <DashboardHeader />
        <main className="p-4 sm:p-6 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">Códigos de Resgate</h1>
            {isLoading && <span className="text-sm text-gray-500 animate-pulse">A atualizar...</span>}
          </div>

          {/* Filtros */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Pesquisar (Código, Nome Utilizador, Email)</label>
                <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Digite para pesquisar..." className="form-input"/>
              </div>
              <div>
                <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-1">Estado do Resgate</label>
                <select id="filtroEstado" value={selectedEstadoFiltro} onChange={(e) => {setSelectedEstadoFiltro(e.target.value); setCurrentPage(1);}} className="form-select">
                  <option value="">Todos os Estados</option>
                  {allEstadosResgate.map(estado => <option key={estado.idEstadoResgate} value={estado.idEstadoResgate.toString()}>{estado.estadoResgate}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filtroEstabelecimento" className="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
                <select id="filtroEstabelecimento" value={selectedEstabelecimentoFiltro} onChange={(e) => {setSelectedEstabelecimentoFiltro(e.target.value); setCurrentPage(1);}} className="form-select">
                  <option value="">Todos Estabelecimentos</option>
                  {allEstabelecimentos.map(est => <option key={est.idEstabelecimento} value={est.idEstabelecimento.toString()}>{est.nomeEstabelecimento}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filtroProduto" className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select id="filtroProduto" value={selectedProdutoFiltro} onChange={(e) => {setSelectedProdutoFiltro(e.target.value); setCurrentPage(1);}} className="form-select">
                  <option value="">Todos os Produtos</option>
                  {allProdutos.map(prod => <option key={prod.idProduto} value={prod.idProduto.toString()}>{prod.nomeProduto}</option>)}
                </select>
              </div>
            </div>
          </div>


          {error && ( <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"> <div className="flex items-center"><InformationCircleIcon className="h-6 w-6 mr-2"/><p className="font-bold">Erro</p></div> <p>{error}</p> </div> )}

          {codes.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Resgate</th>
                    {/* <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th> */}
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codes.map((code) => {
                    // Lógica da Imagem
                    const displayImageUrl = getFullImageUrl(code.Produto?.imagemProduto);
                    const isValidImageUrl = typeof displayImageUrl === 'string';

                    return (
                      <tr key={code.idResgate} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{code.codigo}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            {isValidImageUrl ? (
                              <img src={displayImageUrl} alt={code.Produto?.nomeProduto || 'Produto'} className="h-10 w-10 rounded-md object-contain mr-3 flex-shrink-0 border"/>
                            ) : ( <PhotoIcon className="h-10 w-10 text-gray-300 mr-3 flex-shrink-0"/> )}
                            <span className="truncate max-w-[150px] sm:max-w-xs" title={code.Produto?.nomeProduto}>{code.Produto?.nomeProduto || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                              <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2 flex-shrink-0"/>
                              <div>
                                  <div className="truncate max-w-[120px] sm:max-w-xs" title={code.Utilizador?.nomeUtilizador}>{code.Utilizador?.nomeUtilizador || 'N/A'}</div>
                                  <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-xs" title={code.Utilizador?.emailUtilizador}>{code.Utilizador?.emailUtilizador}</div>
                              </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(code.dataResgate)}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => openDetailsModal(code)} className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Detalhes</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            !isLoading && !error && (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                  <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum código de resgate encontrado.</h3>
                  <p className="mt-2 text-sm text-gray-500">
                      {selectedEstadoFiltro || selectedEstabelecimentoFiltro || selectedProdutoFiltro || debouncedSearchTerm
                          ? "Nenhum código corresponde aos filtros aplicados."
                          : "Ainda não foram gerados códigos de resgate no sistema."}
                  </p>
                </div>
            )
          )}

          {totalPages > 1 && codes.length > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="btn-secondary-small">Anterior</button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="btn-secondary-small ml-3">Próximo</button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div> <p className="text-sm text-gray-700"> A mostrar <span className="font-medium">{codes.length > 0 ? Math.max(1, (currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados </p> </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="pagination-arrow-btn rounded-l-md" aria-label="Página Anterior"><ChevronLeftIcon className="h-5 w-5" aria-hidden="true" /></button>
                    {renderPageNumbers().map((page, index) =>
                        typeof page === 'number' ? ( <button key={`page-${page}`} onClick={() => handlePageChange(page)} disabled={isLoading} aria-current={currentPage === page ? 'page' : undefined} className={currentPage === page ? "pagination-number-btn-active" : "pagination-number-btn"}>{page}</button>
                        ) : (<span key={`ellipsis-${index}`} className="pagination-ellipsis-btn">...</span>)
                    )}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="pagination-arrow-btn rounded-r-md" aria-label="Próxima Página"><ChevronRightIcon className="h-5 w-5" aria-hidden="true" /></button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && selectedCode && (
         <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl mx-auto animate-slideUpModal">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Resgate</h3>
                <button onClick={() => copyToClipboard(selectedCode.codigo)} className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center group focus:outline-none focus:ring-1 focus:ring-blue-500 rounded" title="Copiar código"><span className="font-mono group-hover:underline">{selectedCode.codigo}</span><ClipboardDocumentIcon className="h-4 w-4 ml-2 transition-transform group-hover:scale-110"/></button>
                {copySuccess && <span className="ml-2 text-xs text-green-600 animate-pulse">{copySuccess}</span>}
              </div>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="space-y-5 text-sm">
              <section className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><PhotoIcon className="h-5 w-5 mr-2 text-gray-500"/>Produto Resgatado</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1">
                        {getFullImageUrl(selectedCode.Produto?.imagemProduto) ? (
                            <img src={getFullImageUrl(selectedCode.Produto?.imagemProduto)!} alt={selectedCode.Produto?.nomeProduto || 'Produto'} className="h-28 w-28 rounded-md object-contain border"/>
                        ) : ( <div className="h-28 w-28 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 border"><PhotoIcon className="h-12 w-12"/></div> )}
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        {/* <p><span className="font-medium text-gray-600">ID:</span> {selectedCode.Produto?.idProduto || 'N/A'}</p> */}
                        <p><span className="font-medium text-gray-600">Nome:</span> <span className="text-gray-800">{selectedCode.Produto?.nomeProduto || 'N/A'}</span></p>
                        <p className="flex items-start"><CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0"/><span className="font-medium text-gray-600">Pontos:</span> <span className="text-green-600 font-semibold ml-1">{selectedCode.pontosProduto ?? selectedCode.Produto?.precoProduto ?? 'N/A'}</span></p>
                        <p className="flex items-start"><InformationCircleIcon className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0"/><span className="font-medium text-gray-600">Descrição:</span> <span className="text-gray-700 ml-1 break-words">{selectedCode.Produto?.descricaoProduto || 'N/A'}</span></p>
                    </div>
                </div>
              </section>
              {selectedCode.Produto?.Estabelecimento && (
                <section className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><EstablishmentIcon className="h-5 w-5 mr-2 text-gray-500"/>Estabelecimento</h4>
                    {/* <p><span className="font-medium text-gray-600">ID:</span> {selectedCode.Produto.Estabelecimento.idEstabelecimento || 'N/A'}</p> */}
                    <p><span className="font-medium text-gray-600">Nome:</span> <span className="text-gray-800">{selectedCode.Produto.Estabelecimento.nomeEstabelecimento || 'N/A'}</span></p>
                    {selectedCode.Produto.Estabelecimento.Vizinhanca && (<p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Vizinhança:</span> <span className="text-gray-700 ml-1">{selectedCode.Produto.Estabelecimento.Vizinhanca.nomeFreguesia || 'N/A'}</span></p>)}
                </section>
              )}
              <section className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-gray-500"/>Utilizador</h4>
                {/* <p><span className="font-medium text-gray-600">ID:</span> {selectedCode.Utilizador?.idUtilizador || 'N/A'}</p> */}
                <p><span className="font-medium text-gray-600">Nome:</span> <span className="text-gray-800">{selectedCode.Utilizador?.nomeUtilizador || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{selectedCode.Utilizador?.emailUtilizador || 'N/A'}</span></p>
                {selectedCode.Utilizador?.Vizinhanca && ( <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Vizinhança:</span> <span className="text-gray-700 ml-1">{selectedCode.Utilizador.Vizinhanca.nomeFreguesia || 'N/A'}</span></p>)}
              </section>
              <section>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center"><TicketIcon className="h-5 w-5 mr-2 text-gray-500"/>Detalhes do Resgate</h4>
                <p className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Data:</span> <span className="text-gray-700 ml-1">{formatDate(selectedCode.dataResgate)}</span></p>
                {selectedCode.EstadoResgate && (<p className="flex items-center"><CheckBadgeIcon className="h-4 w-4 mr-1 text-gray-400"/><span className="font-medium text-gray-600">Estado:</span> <span className="text-gray-700 ml-1">{selectedCode.EstadoResgate.estadoResgate}</span></p>)}
              </section>
            </div>
            <div className="mt-8 text-right">
              <button onClick={closeDetailsModal} className="btn-secondary px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 ring-1 ring-gray-300">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};