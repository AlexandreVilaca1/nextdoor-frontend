import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { UserHeader } from './UserHeader';
import { Footer } from '../../components/Footer';
import {
  TicketIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 4;

interface EstabelecimentoInfo {
  idEstabelecimento: number;
  nomeEstabelecimento: string;
}

interface ProdutoInfo {
  idProduto: number;
  nomeProduto: string;
  imagemProduto?: string;
  descricaoProduto?: string;
  Estabelecimento?: EstabelecimentoInfo;
}

interface EstadoResgateInfo {
  idEstadoResgate: number;
  estadoResgate: string;
}

interface UserRedemptionCode {
  idResgateCodigo: number;
  codigo: string;
  dataResgate: string;
  ProdutoidProduto: number;
  UtilizadoridUtilizador: number;
  estadoResgateidEstadoResgate: number;
  Produto?: ProdutoInfo;
  EstadoResgate?: EstadoResgateInfo;
}

interface GetRedemptionCodesResponse {
  redemptionCodes: UserRedemptionCode[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  message?: string;
}

export const UserRedemptionCodes: React.FC = () => {
  const [codes, setCodes] = useState<UserRedemptionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const fetchData = useCallback(async (pageToFetch: number = 1) => {
    setIsLoading(true);
    setError(null);
    const token = Cookies.get('jwt');

    if (!token) {
      setError('Utilizador não autenticado. Por favor, faça login.');
      setIsLoading(false);
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.get<GetRedemptionCodesResponse>(`http://localhost:3000/api/redemptionCodes/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageToFetch, limit: ITEMS_PER_PAGE }
      });
      setCodes(response.data.redemptionCodes || []);
      setTotalPages(response.data.totalPages || 0);
      setCurrentPage(response.data.currentPage || 1);
    } catch (err) {
      console.error("UserRedemptionCodes: Erro ao buscar códigos:", err);
      const axiosError = err as AxiosError<any>;
      const errorMsg = axiosError.response?.data?.error || axiosError.message || 'Falha ao carregar os seus códigos de resgate.';
      setError(errorMsg);
      setCodes([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages === 0) return pageNumbers;
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        let showStartEllipsis = false;
        let showEndEllipsis = false;
        let startPage = Math.max(2, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

        if (currentPage - 1 <= halfPagesToShow) {
            endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
        }
        if (totalPages - currentPage <= halfPagesToShow) {
            startPage = Math.max(2, totalPages - (maxPagesToShow - 2));
        }
        
        pageNumbers.push(1);
        if (startPage > 2) showStartEllipsis = true;
        if (showStartEllipsis) pageNumbers.push('...');
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < totalPages - 1) showEndEllipsis = true;
        if (showEndEllipsis) pageNumbers.push('...');
        pageNumbers.push(totalPages);
    }
    return [...new Set(pageNumbers)];
  };

  const getStatusIconAndColor = (statusName?: string) => {
    const lowerStatus = statusName?.toLowerCase();
    if (lowerStatus === 'utilizado') {
      return { Icon: CheckBadgeIcon, color: 'text-green-500', label: 'Utilizado' };
    }
    if (lowerStatus === 'expirado') {
      return { Icon: ExclamationTriangleIcon, color: 'text-red-500', label: 'Expirado' };
    }
    return { Icon: ClockIcon, color: 'text-yellow-500', label: statusName || 'Pendente' };
  };

  if (isLoading && codes.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100 flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-600">A carregar seus códigos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <UserHeader />
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Meus Códigos de Resgate</h1>
            {isLoading && <span className="text-sm text-gray-500">A atualizar...</span>}
        </div>

        {error && (
            <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md relative flex items-center" role="alert">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2"/>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => fetchData(1)} className="ml-auto btn-secondary-outline text-xs p-1">
                    <ArrowPathIcon className="h-4 w-4"/>
                </button>
            </div>
        )}

        {codes.length > 0 ? (
          <>
            <div className="space-y-6">
              {codes.map((code) => {
                const imageUrl = code.Produto?.imagemProduto;
                const statusInfo = getStatusIconAndColor(code.EstadoResgate?.estadoResgate);

                return (
                  <div key={code.idResgateCodigo} className="bg-white shadow-lg rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex-shrink-0 w-full sm:w-28 h-28 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? (
                        <img src={imageUrl} alt={code.Produto?.nomeProduto || 'Imagem do Produto'} className="w-full h-full object-cover" />
                      ) : (
                        <CubeIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-lg sm:text-xl font-semibold text-green-700 mb-1">Código: {code.codigo}</h2>
                      {code.Produto && (
                        <p className="text-md sm:text-lg text-gray-800 font-medium mb-2">{code.Produto.nomeProduto}</p>
                      )}
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                        <p className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />Data do Resgate: {formatDate(code.dataResgate)}</p>
                        {code.Produto?.Estabelecimento && (
                           <p className="flex items-center"><BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-gray-400" />Estabelecimento: {code.Produto.Estabelecimento.nomeEstabelecimento}</p>
                        )}
                        {code.EstadoResgate && (
                          <p className={`flex items-center font-medium ${statusInfo.color}`}>
                            <statusInfo.Icon className={`h-4 w-4 mr-1.5 ${statusInfo.color}`} />
                            Estado: <span className="ml-1">{statusInfo.label}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-auto self-center sm:self-end">
                      <button
                          className="btn-primary text-sm px-4 py-2 flex items-center"
                          onClick={() => {
                              navigator.clipboard.writeText(code.codigo)
                                .then(() => alert(`Código "${code.codigo}" copiado para a área de transferência!`))
                                .catch(err => console.error('Falha ao copiar código: ', err));
                          }}
                          title="Copiar Código"
                      >
                          <TicketIcon className="h-4 w-4 mr-2"/> Copiar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className="btn-secondary p-2 rounded-full disabled:opacity-50"
                        aria-label="Página Anterior"
                    >
                        <ChevronLeftIcon className="h-5 w-5"/>
                    </button>

                    {renderPageNumbers().map((page, index) => (
                        typeof page === 'number' ? (
                            <button
                                key={`page-${page}`}
                                onClick={() => handlePageChange(page)}
                                disabled={isLoading}
                                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors
                                    ${currentPage === page
                                    ? 'btn-primary'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={`ellipsis-${index}`} className="px-1.5 py-1.5 text-sm text-gray-500">...</span>
                        )
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                        className="btn-secondary p-2 rounded-full disabled:opacity-50"
                        aria-label="Próxima Página"
                    >
                        <ChevronRightIcon className="h-5 w-5"/>
                    </button>
                </div>
            )}
          </>
        ) : (
          !isLoading && !error && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <TicketIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum código de resgate encontrado.</h3>
              <p className="mt-2 text-gray-500">Redima produtos na loja para ver seus códigos aqui.</p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};
