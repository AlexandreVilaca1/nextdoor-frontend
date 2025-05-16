import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronLeftIcon, ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const token = Cookies.get('jwt');
const ITEMS_PER_PAGE = 6;

interface EstabelecimentoFromAPI {
  idEstabelecimento: number;
  nomeEstabelecimento: string;
  EnderecoidEndereco?: number;
  VizinhancaidVizinhanca?: number;
  Endereco?: Address;
  Vizinhanca?: Neighborhood;
  telefoneEstabelecimento: string;
  emailEstabelecimento: string;
}

interface NewEstablishmentFormState {
  nomeEstabelecimento?: string;
  telefoneEstabelecimento?: string;
  emailEstabelecimento?: string;
  rua?: string;
  numeroPorta?: string;
  codigoPostal?: string;
  freguesia?: string;
  distrito?: string;
}

interface Neighborhood {
  idVizinhanca: number;
  nomeFreguesia: string;
}

interface Address {
  idEndereco: number;
  numeroPorta: string;
  distrito: string;
  freguesia: string;
  codigoPostal: string;
  rua: string;
}

export const AdminEstablishments = () => {
  const [allEstabelecimentos, setAllEstabelecimentos] = useState<EstabelecimentoFromAPI[]>([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);

  const [newEstablishment, setNewEstablishment] = useState<NewEstablishmentFormState>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEstablishmentDetails, setSelectedEstablishmentDetails] = useState<EstabelecimentoFromAPI | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterNeighborhoodId, setSelectedFilterNeighborhoodId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleError = useCallback((err: any, defaultMessage: string) => {
    console.error(defaultMessage, err);
    let errorMessageText = defaultMessage;
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data;
        errorMessageText = `${errorData.message || errorData.error || defaultMessage}`;
        if (errorData.details) {
          errorMessageText += ` Detalhes: ${Array.isArray(errorData.details) ? errorData.details.map((d:any) => d.message || d).join(', ') : JSON.stringify(errorData.details)}`;
        }
      } else if (axiosError.request) {
        errorMessageText = "Erro de rede ou servidor não respondeu.";
      }
    }
    setMessage({ text: errorMessageText, type: 'error' });
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [estabRes, neighRes, addrRes] = await Promise.all([
        axios.get('http://localhost:3000/api/establishments/all', config),
        axios.get('http://localhost:3000/api/neighborhoods/', config),
        axios.get('http://localhost:3000/api/addresses', config)
      ]);

      setAllEstabelecimentos(estabRes.data.establishments || []);
      setAllNeighborhoods(neighRes.data.neighborhoods || neighRes.data.neighborhood || (Array.isArray(neighRes.data) ? neighRes.data : []));
      setAllAddresses(Array.isArray(addrRes.data) ? addrRes.data : addrRes.data.addresses || []);

    } catch (err) {
      handleError(err, 'Erro fatal ao carregar dados das listas.');
      setAllEstabelecimentos([]);
      setAllNeighborhoods([]);
      setAllAddresses([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEstabelecimentos = useMemo(() => {
    return allEstabelecimentos
      .filter(est =>
        est.nomeEstabelecimento.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(est =>
        selectedFilterNeighborhoodId === "" || est.VizinhancaidVizinhanca === Number(selectedFilterNeighborhoodId)
      );
  }, [allEstabelecimentos, searchTerm, selectedFilterNeighborhoodId]);

  const totalPages = Math.ceil(filteredEstabelecimentos.length / ITEMS_PER_PAGE);
  const currentEstabelecimentosToDisplay = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredEstabelecimentos.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredEstabelecimentos, currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEstablishment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEstablishment = async () => {
    const {
      nomeEstabelecimento, telefoneEstabelecimento, emailEstabelecimento,
      rua, numeroPorta, codigoPostal, freguesia, distrito,
    } = newEstablishment;

    if (!nomeEstabelecimento?.trim() || !telefoneEstabelecimento?.trim() || !emailEstabelecimento?.trim() ||
        !rua?.trim() || !numeroPorta?.trim() || !codigoPostal?.trim() || !freguesia?.trim() || !distrito?.trim()) {
      setMessage({ text: 'Todos os campos marcados com * são obrigatórios.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const addressPayload = { rua, numeroPorta, codigoPostal, freguesia, distrito };
      const addressRes = await axios.post('http://localhost:3000/api/addresses', addressPayload, {
      });

      if (addressRes.status !== 201 || !addressRes.data.address || !addressRes.data.address.idEndereco) {
        throw new Error('Falha ao criar o endereço ou ID do endereço não retornado.');
      }
      const newAddressId = addressRes.data.address.idEndereco;
      setAllAddresses(prev => [...prev, addressRes.data.address]);

      let vizinhancaId: number;
      const nomeFreguesiaNormalizado = freguesia.trim();

      try {
        const searchRes = await axios.get(`http://localhost:3000/api/neighborhoods/byName/${encodeURIComponent(nomeFreguesiaNormalizado)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (searchRes.data && searchRes.data.neighborhood && searchRes.data.neighborhood.idVizinhanca) {
            vizinhancaId = searchRes.data.neighborhood.idVizinhanca;
        } else {
            throw new Error("Neighborhood not found by name, proceeding to create.");
        }
      } catch (searchError: any) {
        if (axios.isAxiosError(searchError) && searchError.response && searchError.response.status === 404) {
            const neighborhoodPayload = { nomeFreguesia: nomeFreguesiaNormalizado };
            const neighborhoodRes = await axios.post('http://localhost:3000/api/neighborhoods/', neighborhoodPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (neighborhoodRes.status !== 201 || !neighborhoodRes.data.neighborhood || !neighborhoodRes.data.neighborhood.idVizinhanca) {
                throw new Error('Falha ao criar a vizinhança ou ID da vizinhança não retornado.');
            }
            vizinhancaId = neighborhoodRes.data.neighborhood.idVizinhanca;
            setAllNeighborhoods(prev => [...prev, neighborhoodRes.data.neighborhood]);
        } else {
            console.error("Error searching neighborhood by name:", searchError);
            throw new Error(searchError.response?.data?.message || searchError.message || 'Erro ao procurar vizinhança por nome.');
        }
      }

      const establishmentPayload = {
        nomeEstabelecimento,
        telefoneEstabelecimento,
        emailEstabelecimento,
        EnderecoidEndereco: newAddressId,
        VizinhancaidVizinhanca: vizinhancaId,
      };
      await axios.post('http://localhost:3000/api/establishments/', establishmentPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ text: 'Estabelecimento adicionado com sucesso!', type: 'success' });
      setShowFormModal(false);
      setNewEstablishment({});
      fetchData(); 

    } catch (err: any) {
      if (!message) { 
         handleError(err, err.message || 'Erro ao adicionar estabelecimento.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddressForDisplay = (addressId: number | undefined): string => {
    if (addressId === undefined) return 'N/A';
    const address = allAddresses.find(addr => addr.idEndereco === addressId);
    return address ? `${address.rua}, ${address.numeroPorta || ''} - ${address.codigoPostal} ${address.freguesia}, ${address.distrito}` : `Endereço ID ${addressId} não encontrado`;
  };

  const getNeighborhoodName = (neighborhoodId: number | undefined): string => {
    if (neighborhoodId === undefined) return 'N/A';
    return allNeighborhoods.find(n => n.idVizinhanca === neighborhoodId)?.nomeFreguesia || `Vizinhança ID ${neighborhoodId} não encontrada`;
  };

  const handleOpenDetailsModal = (est: EstabelecimentoFromAPI) => {
    setSelectedEstablishmentDetails(est);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEstablishmentDetails(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilterNeighborhoodId]);

  const renderPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages === 0) return pageNumbers;
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        if (currentPage > halfPagesToShow + 2 && totalPages > maxPagesToShow) pageNumbers.push(1);
        if (currentPage > halfPagesToShow + 3 && totalPages > maxPagesToShow +1) pageNumbers.push('...');

        let startPage = Math.max(1, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages, currentPage + halfPagesToShow);
        
        if (currentPage <= halfPagesToShow) { 
          startPage = 1;
          endPage = Math.min(totalPages, maxPagesToShow -1 < totalPages ? maxPagesToShow -1 : totalPages);
          if(totalPages > maxPagesToShow && endPage < totalPages -1) endPage = maxPagesToShow -2 ; 
        } else if (currentPage >= totalPages - halfPagesToShow) { 
          startPage = Math.max(1, totalPages - (maxPagesToShow -2) > 1 ? totalPages - (maxPagesToShow -2) : 1);
          endPage = totalPages;
        }


        for (let i = startPage; i <= endPage; i++) {
            if(!pageNumbers.includes(i)) pageNumbers.push(i);
        }

        if (currentPage < totalPages - halfPagesToShow - 2 && totalPages > maxPagesToShow +1 && endPage < totalPages -1) pageNumbers.push('...');
        if (totalPages > 1 && !pageNumbers.includes(totalPages) && endPage < totalPages) pageNumbers.push(totalPages);
    }
    return [...new Set(pageNumbers)]; 
  };

  if (isLoadingData && allEstabelecimentos.length === 0) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <div className="flex-1 flex items-center justify-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="ml-3 text-xl text-gray-600">A carregar dados...</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 mr-3 text-blue-600" />
              Gestão de Estabelecimentos
            </h2>
            <button
              className="btn-primary mt-4 sm:mt-0"
              onClick={() => { setShowFormModal(true); setMessage(null); setNewEstablishment({}); }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Adicionar Estabelecimento
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 text-center rounded-md shadow text-sm flex items-center justify-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              <InformationCircleIcon className="h-5 w-5" />
              <span>{message.text}</span>
            </div>
          )}

          <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="searchNomeEstabelecimento" className="form-label">Pesquisar por Nome</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="searchNomeEstabelecimento"
                            className="form-input pl-10"
                            placeholder="Nome do estabelecimento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="filterNeighborhood" className="form-label">Filtrar por Vizinhança (Freguesia)</label>
                    <select
                    id="filterNeighborhood"
                    value={selectedFilterNeighborhoodId}
                    onChange={(e) => setSelectedFilterNeighborhoodId(e.target.value)}
                    className="form-select mt-1"
                    >
                    <option value="">Todas as Vizinhanças</option>
                    {allNeighborhoods
                        .sort((a, b) => a.nomeFreguesia.localeCompare(b.nomeFreguesia))
                        .map(n => (
                            <option key={n.idVizinhanca} value={n.idVizinhanca.toString()}>{n.nomeFreguesia}</option>
                    ))}
                    </select>
                </div>
                <div className="mt-4 md:mt-0 lg:col-start-3"> 
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedFilterNeighborhoodId(''); setCurrentPage(1);}}
                        className="btn-secondary w-full flex items-center justify-center py-2.5"
                        title="Limpar todos os filtros"
                    >
                        <XMarkIcon className="h-5 w-5 mr-2" /> 
                        Limpar Filtros
                    </button>
                </div>
            </div>
          </div>

          {showFormModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300" onClick={() => setShowFormModal(false)}>
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">Adicionar Novo Estabelecimento</h3>
                  <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddEstablishment(); }} className="space-y-5">
                  <div>
                    <label htmlFor="nomeEstabelecimento" className="form-label">Nome <span className="text-red-500">*</span></label>
                    <input id="nomeEstabelecimento" type="text" name="nomeEstabelecimento" className="form-input" value={newEstablishment.nomeEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label htmlFor="telefoneEstabelecimento" className="form-label">Telefone <span className="text-red-500">*</span></label>
                    <input id="telefoneEstabelecimento" type="tel" name="telefoneEstabelecimento" className="form-input" value={newEstablishment.telefoneEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label htmlFor="emailEstabelecimento" className="form-label">Email <span className="text-red-500">*</span></label>
                    <input id="emailEstabelecimento" type="email" name="emailEstabelecimento" className="form-input" value={newEstablishment.emailEstabelecimento || ''} onChange={handleInputChange} required />
                  </div>

                  <fieldset className="border p-4 rounded-md">
                    <legend className="text-sm font-medium text-gray-700 px-1">Detalhes do Endereço <span className="text-red-500">*</span></legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <label htmlFor="rua" className="form-label">Rua <span className="text-red-500">*</span></label>
                            <input id="rua" type="text" name="rua" className="form-input" value={newEstablishment.rua || ''} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label htmlFor="numeroPorta" className="form-label">Nº Porta <span className="text-red-500">*</span></label>
                            <input id="numeroPorta" type="text" name="numeroPorta" className="form-input" value={newEstablishment.numeroPorta || ''} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label htmlFor="codigoPostal" className="form-label">Código Postal <span className="text-red-500">*</span></label>
                            <input id="codigoPostal" type="text" name="codigoPostal" className="form-input" value={newEstablishment.codigoPostal || ''} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label htmlFor="freguesia" className="form-label">Freguesia (Vizinhança) <span className="text-red-500">*</span></label>
                            <input id="freguesia" type="text" name="freguesia" className="form-input" value={newEstablishment.freguesia || ''} onChange={handleInputChange} required placeholder="Ex: Lomar"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="distrito" className="form-label">Distrito <span className="text-red-500">*</span></label>
                            <input id="distrito" type="text" name="distrito" className="form-input" value={newEstablishment.distrito || ''} onChange={handleInputChange} required />
                        </div>
                    </div>
                  </fieldset>

                  <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                    <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          A Adicionar...
                        </span>
                      ) : 'Adicionar Estabelecimento'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ver Detalhes */}
          {showDetailsModal && selectedEstablishmentDetails && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={handleCloseDetailsModal}>
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center pb-4 mb-5 border-b">
                        <h3 className="text-xl font-semibold text-blue-700">{selectedEstablishmentDetails.nomeEstabelecimento}</h3>
                        <button onClick={handleCloseDetailsModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Telefone:</strong> {selectedEstablishmentDetails.telefoneEstabelecimento}</p>
                        <p className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Email:</strong> {selectedEstablishmentDetails.emailEstabelecimento}</p>
                        <p className="flex items-start"><MapPinIcon className="h-4 w-4 mr-2 text-gray-500 mt-0.5 shrink-0"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Endereço:</strong> <span>{selectedEstablishmentDetails.Endereco ? formatAddressForDisplay(selectedEstablishmentDetails.Endereco.idEndereco) : formatAddressForDisplay(selectedEstablishmentDetails.EnderecoidEndereco)}</span></p>
                        <p className="flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2 text-gray-500"/> <strong className="font-medium text-gray-600 w-20 shrink-0">Vizinhança:</strong> {selectedEstablishmentDetails.Vizinhanca?.nomeFreguesia || getNeighborhoodName(selectedEstablishmentDetails.VizinhancaidVizinhanca)}</p>
                    </div>
                    <div className="mt-8 pt-5 border-t flex justify-end">
                        <button className="btn-secondary" onClick={handleCloseDetailsModal}>Fechar</button>
                    </div>
                </div>
            </div>
          )}

          {isLoadingData && currentEstabelecimentosToDisplay.length === 0 && allEstabelecimentos.length > 0 && (
            <div className="py-4 text-center text-gray-500">A aplicar filtros...</div>
          )}
          {!isLoadingData && filteredEstabelecimentos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <BuildingStorefrontIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-3 text-lg font-semibold text-gray-700">Nenhum estabelecimento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedFilterNeighborhoodId ? "Nenhum estabelecimento corresponde aos filtros." : "Comece por adicionar um novo estabelecimento."}
              </p>
            </div>
          )}

          {currentEstabelecimentosToDisplay.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {currentEstabelecimentosToDisplay.map(est => (
                <div key={est.idEstabelecimento} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
                  <div className="p-5 flex flex-col flex-grow">
                    <h3
                      className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 cursor-pointer transition-colors truncate"
                      onClick={() => handleOpenDetailsModal(est)}
                      title={est.nomeEstabelecimento}
                    >
                      {est.nomeEstabelecimento}
                    </h3>
                    <div className="text-xs text-gray-500 mt-3 space-y-2 flex-grow">
                        <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/>
                          <span className="truncate" title={est.Endereco ? formatAddressForDisplay(est.Endereco.idEndereco) : formatAddressForDisplay(est.EnderecoidEndereco)}>{est.Endereco ? formatAddressForDisplay(est.Endereco.idEndereco) : formatAddressForDisplay(est.EnderecoidEndereco)}</span>
                        </p>
                        <p className="flex items-center"><GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/>
                          <span className="truncate" title={est.Vizinhanca?.nomeFreguesia || getNeighborhoodName(est.VizinhancaidVizinhanca)}>{est.Vizinhanca?.nomeFreguesia || getNeighborhoodName(est.VizinhancaidVizinhanca)}</span>
                        </p>
                        <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/>
                          <span>{est.telefoneEstabelecimento}</span>
                        </p>
                        <p className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400 shrink-0"/>
                          <span className="truncate" title={est.emailEstabelecimento}>{est.emailEstabelecimento}</span>
                        </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100">
                         <button
                            onClick={() => handleOpenDetailsModal(est)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-left py-1"
                        >
                            Ver Detalhes →
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingData}
                    className="btn-secondary p-2 rounded-full disabled:opacity-50"
                    aria-label="Página Anterior"
                >
                    <ChevronLeftIcon className="h-5 w-5"/>
                </button>

                {renderPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            disabled={isLoadingData}
                            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors
                                ${currentPage === page
                                ? 'btn-primary'
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
                    disabled={currentPage === totalPages || isLoadingData}
                    className="btn-secondary p-2 rounded-full disabled:opacity-50"
                    aria-label="Próxima Página"
                >
                    <ChevronRightIcon className="h-5 w-5"/>
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};