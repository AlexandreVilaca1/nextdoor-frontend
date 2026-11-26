import React, { useEffect, useState, useMemo, useCallback, useRef, JSX, Fragment } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { Dialog, Transition } from '@headlessui/react';
import {
    MagnifyingGlassIcon,
    TagIcon,
    PhotoIcon as PlaceholderPhotoIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon as CheckCircleOutlineIcon,
    XCircleIcon as XCircleOutlineIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { UserHeader } from './UserHeader'; 
import { Footer } from '../../components/Footer'; 
import "../../styles.css"; 

// --- Interfaces ---
interface Produto {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number;
  descricaoProduto: string;
  imagemProduto?: string; 
  tipoProdutoidTipoProduto: number;
  stockProduto?: number;
  Estabelecimento?: { idEstabelecimento?: number; nomeEstabelecimento: string; };
  tipoProduto?: { idTipoProduto?: number; tipoProduto: string; };
  idVizinhanca?: number;
}
interface Categoria {
    idTipoProduto: number;
    nomeTipoProduto: string;
}
interface RedemptionCodeData {
  idResgate: number;
  codigo: string;
  dataResgate: string;
  ProdutoResgatado?: {
    nomeProduto: string;
    precoProduto: number;
    imagemProduto?: string;
  };
}
interface CreateRedemptionCodeResponse {
  message: string;
  redemptionCode?: RedemptionCodeData;
}
interface NeighborhoodProductsResponse {
  message: string;
  products: Produto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
interface ProductTypesApiResponse {
    productTypes: Categoria[];
}
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ADMIN_SELECTED_NEIGHBORHOOD_ID_KEY = 'adminSelectedNeighborhoodId';

// --- Componente Modal de Confirmação  ---
const ConfirmationModalComponent: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmButtonText = 'Confirmar', cancelButtonText = 'Cancelar',
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-700 bg-opacity-40 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10`}>
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">{title}</Dialog.Title>
                      <div className="mt-2"><div className="text-sm text-gray-500">{message}</div></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors bg-green-600 hover:bg-green-700 focus-visible:ring-green-500`} onClick={() => { onConfirm(); onClose(); }}>{confirmButtonText}</button>
                  <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors" onClick={onClose}>{cancelButtonText}</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};


export const UserProduct: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const productsContainerRef = useRef<HTMLDivElement>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToRedeem, setProductToRedeem] = useState<{id: number; nome: string; pontos: number;} | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState<boolean | null>(null);

  const getFullProductImageUrl = useCallback((imagePath?: string): string | null => {
    if (!imagePath || imagePath.trim() === "") return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:3000${imagePath}`;
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
        const token = Cookies.get('jwt');
        if (token) {
            try {
                const response = await axios.get<{ user: { tipoUtilizadoridTipoUtilizador?: number } }>(
                    'http://localhost:3000/api/users/profile',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsCurrentUserAdmin(response.data.user?.tipoUtilizadoridTipoUtilizador === 1);
            } catch (e) {
                console.error("UserProduct: Erro ao verificar o tipo do usuário:", e);
                setIsCurrentUserAdmin(false);
                setError("Não foi possível verificar as permissões do usuário.");
            }
        } else {
            setIsCurrentUserAdmin(false);
        }
    };
    checkUserRole();
  }, []);

  const fetchData = useCallback(async (page = 1, adminOverrideNeighborhoodId: string | null = null) => {
    if (isCurrentUserAdmin === null && !adminOverrideNeighborhoodId) {
        setIsLoading(true); 
        return;
    }

    setIsLoading(true);
    setError(null); 
    setRedeemMessage(null); 
    const token = Cookies.get('jwt');

    if (!token && !isCurrentUserAdmin) { 
      setError('Utilizador não autenticado. Por favor, faça login.');
      setIsLoading(false);
      setProdutos([]); 
      setCategorias([]);
      setTotalPages(0);
      return;
    }

    try {
      let productsUrl = `http://localhost:3000/api/products/neighborhood?page=${page}&limit=12`;
      const currentAdminSelectedId = adminOverrideNeighborhoodId || (isCurrentUserAdmin ? localStorage.getItem(ADMIN_SELECTED_NEIGHBORHOOD_ID_KEY) : null);

      if (isCurrentUserAdmin && currentAdminSelectedId) {
          productsUrl += `&vizinhancaId=${currentAdminSelectedId}`;
      } else if (isCurrentUserAdmin && !currentAdminSelectedId) {
          console.warn("UserProduct: Admin não selecionou vizinhança. Nenhum produto será carregado pela rota /neighborhood.");
          setProdutos([]);
          setTotalPages(0);
          const categoriesResponse = await axios.get<ProductTypesApiResponse>(`http://localhost:3000/api/product-types/`, { headers: { Authorization: `Bearer ${token}` }});
          setCategorias(categoriesResponse.data.productTypes || []);
          setIsLoading(false);
          return;
      }


      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get<NeighborhoodProductsResponse>(productsUrl, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get<ProductTypesApiResponse>(`http://localhost:3000/api/product-types/`, { headers: { Authorization: `Bearer ${token}` }})
      ]);

      const fetchedProducts = productsResponse.data.products || [];
      setProdutos(fetchedProducts);
      setCurrentPage(productsResponse.data.currentPage || 1);
      setTotalPages(productsResponse.data.totalPages || 0);
      setCategorias(categoriesResponse.data.productTypes || []);

    } catch (err) {
      console.error("UserProduct: Erro ao buscar dados:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Sessão inválida ou expirada. Por favor, faça login novamente.');
        Cookies.remove('jwt'); 
      } else {
        const axiosError = err as AxiosError<any>;
        const errorMsg = axiosError.response?.data?.error || 'Falha ao carregar os dados dos produtos.';
        setError(errorMsg);
      }
      setProdutos([]);
      setCategorias([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [isCurrentUserAdmin]); 
  useEffect(() => {
    if (isCurrentUserAdmin !== null) { 
        fetchData(currentPage);
    }
  }, [fetchData, currentPage, isCurrentUserAdmin]);


  useEffect(() => {
    const handleAdminNeighborhoodChange = (event: Event) => {
        const customEvent = event as CustomEvent<{ neighborhoodId: number }>;
        if (customEvent.detail?.neighborhoodId && isCurrentUserAdmin) {
            setCurrentPage(1); 
            fetchData(1, customEvent.detail.neighborhoodId.toString());
        }
    };

    if (typeof window !== 'undefined' && isCurrentUserAdmin !== null) { 
        window.addEventListener('adminNeighborhoodChanged', handleAdminNeighborhoodChange);
    }

    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('adminNeighborhoodChanged', handleAdminNeighborhoodChange);
        }
    };
  }, [isCurrentUserAdmin, fetchData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
      setCurrentPage(newPage);
       if (productsContainerRef.current) { 
            productsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  };

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearchTerm = produto.nomeProduto.toLowerCase().includes(lowerSearchTerm);
      let matchesCategory = true;
      if (selectedCategoria) {
        const selectedCategoriaId = parseInt(selectedCategoria, 10);
        matchesCategory = produto.tipoProdutoidTipoProduto === selectedCategoriaId;
      }
      return matchesSearchTerm && matchesCategory;
    });
  }, [produtos, searchTerm, selectedCategoria]);

  const openConfirmationModal = (produtoId: number, nomeProdutoExibicao: string, pontosNecessarios: number) => {
    setRedeemMessage(null);
    setProductToRedeem({ id: produtoId, nome: nomeProdutoExibicao, pontos: pontosNecessarios });
    setIsConfirmModalOpen(true);
  };

  const confirmRedeem = async () => {
    if (!productToRedeem) return;
    const token = Cookies.get('jwt');
    if (!token) {
      setRedeemMessage({ type: 'error', text: "Sessão expirada. Por favor, faça login novamente." });
      setIsConfirmModalOpen(false); return;
    }
    setIsRedeeming(productToRedeem.id);
    setRedeemMessage(null);
    setIsConfirmModalOpen(false); 

    try {
      const payload = { ProdutoidProduto: productToRedeem.id };
      const response = await axios.post<CreateRedemptionCodeResponse>( `http://localhost:3000/api/redemptionCodes`, payload, { headers: { Authorization: `Bearer ${token}` } } );
      if (response.data.redemptionCode && response.data.redemptionCode.codigo) {
        const nomeProdutoResgatado = response.data.redemptionCode.ProdutoResgatado?.nomeProduto || productToRedeem.nome;
        setRedeemMessage({ type: 'success', text: `Produto "${nomeProdutoResgatado}" resgatado! Seu código é: ${response.data.redemptionCode.codigo}` });
      } else if (response.data.message) {
        setRedeemMessage({ type: 'success', text: response.data.message });
      } else {
        setRedeemMessage({ type: 'success', text: "Produto resgatado com sucesso!" });
      }
      const adminSelectedId = isCurrentUserAdmin ? localStorage.getItem(ADMIN_SELECTED_NEIGHBORHOOD_ID_KEY) : null;
      fetchData(currentPage, adminSelectedId); 
    } catch (err: any) {
      console.error("UserProduct: Erro ao redimir produto:", err);
      let errorMessage = "Falha ao redimir o produto.";
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        errorMessage = err.response.data.error || "Ocorreu um erro ao processar o resgate.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setRedeemMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsRedeeming(null);
      setProductToRedeem(null);
    }
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -productsContainerRef.current.offsetWidth * 0.8 : productsContainerRef.current.offsetWidth * 0.8;
      productsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons: JSX.Element[] = [];
    const maxVisibleButtons = 5;
    if (totalPages <= 1) return null;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    if (startPage > 1) {
      buttons.push(<button key={1} onClick={() => handlePageChange(1)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60`}>1</button>);
      if (startPage > 2) buttons.push(<span key="dots-start" className="px-1 sm:px-2 py-2 text-gray-700">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(<button key={i} onClick={() => handlePageChange(i)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base ${currentPage === i ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} disabled:opacity-60`}>{i}</button>);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push(<span key="dots-end" className="px-1 sm:px-2 py-2 text-gray-700">...</span>);
      buttons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60`}>{totalPages}</button>);
    }
    return buttons;
  };

  if (isCurrentUserAdmin === null && !error) { 
    return (
        <div className="flex min-h-screen bg-gray-100 flex-col">
            <UserHeader />
            <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle> <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path> </svg>
                <p className="ml-3 text-center text-gray-600 text-lg">A verificar permissões...</p>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <UserHeader />
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {redeemMessage && (
          <div className={`mb-6 p-4 rounded-lg text-center text-sm shadow-md transition-all duration-300 ease-in-out transform flex items-center justify-center gap-2 ${redeemMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`} role="alert">
            {redeemMessage.type === 'success' ? <CheckCircleOutlineIcon className="h-5 w-5 text-green-500" /> : <XCircleOutlineIcon className="h-5 w-5 text-red-500" />}
            <span>{redeemMessage.text}</span>
          </div>
        )}

        <div className="mb-8 p-5 sm:p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Pesquisar por nome..." className="form-input pl-10 w-full !py-2.5 shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px]">
            <select className="form-select w-full !py-2.5 shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 rounded-md" value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} >
              <option value="">Todas as Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.idTipoProduto} value={cat.idTipoProduto.toString()}>
                  {cat.nomeTipoProduto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && !produtos.length && ( 
            <div className="text-center py-16"><p className="text-gray-600 text-lg">A carregar produtos...</p></div>
        )}

        {!isLoading && error && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md mt-8">
              <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400" />
              <h3 className="mt-4 text-xl font-semibold text-red-700">Ocorreu um erro</h3>
              <p className="mt-2 text-gray-500">{error}</p>
            </div>
        )}

        {!isLoading && !error && filteredProdutos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md mt-8">
              <TagIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum produto encontrado</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedCategoria
                  ? "Tente alterar os termos da sua pesquisa ou o filtro de categoria."
                  : (isCurrentUserAdmin && !localStorage.getItem(ADMIN_SELECTED_NEIGHBORHOOD_ID_KEY))
                  ? "Administrador: Por favor, selecione uma vizinhança no cabeçalho para ver os produtos."
                  : "Parece que não há produtos disponíveis na sua vizinhança no momento."}
              </p>
            </div>
        )}

        {!isLoading && !error && filteredProdutos.length > 0 && (
          <div className="relative group/productsection">
            {filteredProdutos.length > (window.innerWidth < 640 ? 1 : window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4) && ( // Ajuste para mostrar botões de scroll se necessário
              <>
                <button onClick={() => scrollProducts('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg -ml-3 sm:-ml-4 transition-all opacity-0 group-hover/productsection:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Scroll Left"><ChevronLeftIcon className="h-6 w-6 text-gray-700" /></button>
                <button onClick={() => scrollProducts('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg -mr-3 sm:-mr-4 transition-all opacity-0 group-hover/productsection:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Scroll Right"><ChevronRightIcon className="h-6 w-6 text-gray-700" /></button>
              </>
            )}
            <div ref={productsContainerRef} className="flex overflow-x-auto py-4 -mx-2 px-2 space-x-4 sm:space-x-6 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {filteredProdutos.map((produto) => {
                const displayImageUrl = getFullProductImageUrl(produto.imagemProduto);
                const isValidImageUrl = typeof displayImageUrl === 'string';

                return (
                  <div key={produto.idProduto} className="flex-shrink-0 w-60 sm:w-64 bg-white rounded-xl shadow-lg flex flex-col group/card transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1" style={{ scrollSnapAlign: 'start' }}>
                    <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-t-xl overflow-hidden">
                      {isValidImageUrl ? (
                        <img
                            src={displayImageUrl}
                            alt={produto.nomeProduto}
                            className="w-full h-full object-contain group-hover/card:scale-105 transition-transform duration-300" // object-contain para evitar zoom
                            onError={(e) => {
                                const imgTarget = e.target as HTMLImageElement;
                                const parent = imgTarget.parentElement;
                                if (parent) {
                                    imgTarget.remove(); 
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = "w-full h-full flex items-center justify-center text-gray-400";
                                    fallbackDiv.innerHTML = `<svg class="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`;
                                    parent.appendChild(fallbackDiv);
                                }
                            }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <PlaceholderPhotoIcon className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <h3 className="text-base sm:text-md font-semibold text-gray-800 truncate group-hover/card:text-green-600 transition-colors" title={produto.nomeProduto}>{produto.nomeProduto}</h3>
                      {produto.Estabelecimento && (<p className="text-xs text-gray-500 mt-0.5 truncate" title={produto.Estabelecimento.nomeEstabelecimento}><span className="font-medium">Estab:</span> {produto.Estabelecimento.nomeEstabelecimento}</p>)}
                      <p className="text-xs text-purple-600 mt-0.5 truncate" title={produto.tipoProduto?.tipoProduto}><span className="font-medium">Cat:</span> {produto.tipoProduto?.tipoProduto || 'N/A'}</p>
                      <p className="text-lg font-bold text-green-600 mt-2 mb-3">{produto.precoProduto} <span className="text-sm font-normal text-gray-500">Pontos</span></p>
                      <button
                        onClick={() => openConfirmationModal(produto.idProduto, produto.nomeProduto, produto.precoProduto)}
                        className={`py-2 px-4 rounded-md text-white font-semibold text-sm w-full flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isRedeeming === produto.idProduto ? 'bg-green-700 cursor-not-allowed opacity-75' : 'bg-green-600 hover:bg-green-700'}`}
                        disabled={isRedeeming === produto.idProduto || (produto.stockProduto !== undefined && produto.stockProduto <= 0)} // Desabilita se stock for 0 ou undefined
                      >
                        {isRedeeming === produto.idProduto ? (
                          <><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>A Redimir...</span></>
                        ) : (produto.stockProduto !== undefined && produto.stockProduto <= 0) ? (
                            <span>Esgotado</span>
                        ) : (
                          <><ShoppingCartIcon className="h-5 w-5 mr-1.5" /><span>Obter</span></>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && filteredProdutos.length > 0 && (
                <div className="mt-10 flex justify-center items-center space-x-1 sm:space-x-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="px-3 py-2 sm:px-4 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">Anterior</button>
                    {renderPaginationButtons()}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="px-3 py-2 sm:px-4 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">Próxima</button>
                </div>
            )}
          </div>
        )}
      </main>
      <Footer />

      {productToRedeem && (
        <ConfirmationModalComponent
          isOpen={isConfirmModalOpen}
          onClose={() => { setIsConfirmModalOpen(false); setProductToRedeem(null); }}
          onConfirm={confirmRedeem}
          title="Atenção: Confirmar Resgate"
          message={ <p> Tem certeza que deseja redimir o produto <strong className="font-semibold text-gray-700">"{productToRedeem.nome}"</strong> por <strong className="font-semibold text-green-600">{productToRedeem.pontos}</strong> pontos? </p> }
          confirmButtonText="Sim, Redimir"
          cancelButtonText="Não, Cancelar"
        />
      )}
    </div>
  );
};