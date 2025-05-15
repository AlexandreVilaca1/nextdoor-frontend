// src/components/UserProduct.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { 
    MagnifyingGlassIcon, 
    TagIcon, 
    PhotoIcon as PlaceholderPhotoIcon, 
    ChevronLeftIcon,
    ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { UserHeader } from './UserHeader'; 
import { Footer } from '../../components/Footer'; 


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
}
interface Categoria { idTipoProduto: number; tipoProduto: string; }
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
  const [redeemMessage, setRedeemMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const productsContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    const token = Cookies.get('jwt');

    if (!token) {
      setError('Utilizador não autenticado. Por favor, faça login.');
      setIsLoading(false);
      if (typeof window !== 'undefined') {
          window.location.href = '/login'; 
      }
      return;
    }

    try {
      const productsRes = await axios.get<NeighborhoodProductsResponse>(`http://localhost:3000/api/products/neighborhood?page=${page}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const categoriesRes = await axios.get<{ productTypes: Categoria[] }>(`http://localhost:3000/api/product-types/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProdutos(productsRes.data.products || []);
      setCurrentPage(productsRes.data.currentPage || 1);
      setTotalPages(productsRes.data.totalPages || 0);
      setCategorias(categoriesRes.data.productTypes || []); 

    } catch (err) {
      console.error("UserProduct: Erro ao buscar dados:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError('Sessão inválida ou expirada. Por favor, faça login novamente.');
          Cookies.remove('jwt');
          if (typeof window !== 'undefined') window.location.href = '/login';
      } else {
          const axiosError = err as AxiosError<any>;
          const errorMsg = axiosError.response?.data?.error || 'Falha ao carregar os produtos ou categorias.';
          setError(errorMsg);
      }
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

  const handleRedeem = async (produtoId: number, nomeProdutoExibicao: string, pontosNecessarios: number) => {
    const token = Cookies.get('jwt');
    if (!token) {
      setRedeemMessage({type: 'error', text: "Sessão expirada. Por favor, faça login novamente."});
      return;
    }
    if (!window.confirm(`Tem certeza que deseja redimir "${nomeProdutoExibicao}" por ${pontosNecessarios} pontos?`)) return;
    
    setIsRedeeming(produtoId);
    setRedeemMessage(null);

    try {
      const payload = { ProdutoidProduto: produtoId }; 
      const response = await axios.post<CreateRedemptionCodeResponse>(
        `http://localhost:3000/api/redemptionCodes`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.redemptionCode && response.data.redemptionCode.codigo) {
        const nomeProdutoResgatado = response.data.redemptionCode.ProdutoResgatado?.nomeProduto || nomeProdutoExibicao;
        setRedeemMessage({
            type: 'success', 
            text: `Produto "${nomeProdutoResgatado}" resgatado! Seu código é: ${response.data.redemptionCode.codigo}`
        });
      } else if (response.data.message) { 
        setRedeemMessage({type: 'success', text: response.data.message});
      } else { 
        setRedeemMessage({type: 'success', text: "Produto resgatado com sucesso!"});
      }
      fetchData(currentPage);
    } catch (err: any) {
      console.error("UserProduct: Erro ao redimir produto:", err);
      let errorMessage = "Falha ao redimir o produto.";
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        errorMessage = err.response.data.error || "Ocorreu um erro ao processar o resgate.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setRedeemMessage({type: 'error', text: errorMessage});
    } finally {
      setIsRedeeming(null);
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
    if (endPage - startPage + 1 < maxVisibleButtons) startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    if (startPage > 1) {
        buttons.push(<button key={1} onClick={() => handlePageChange(1)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-50`}>1</button>);
        if (startPage > 2) buttons.push(<span key="dots-start" className="px-1 sm:px-2 py-2 text-gray-700">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(<button key={i} onClick={() => handlePageChange(i)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base ${currentPage === i ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{i}</button>);
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) buttons.push(<span key="dots-end" className="px-1 sm:px-2 py-2 text-gray-700">...</span>);
        buttons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} disabled={isLoading} className={`px-3 py-2 sm:px-4 border rounded-md text-sm sm:text-base bg-white text-gray-700 hover:bg-gray-50`}>{totalPages}</button>);
    }
    return buttons;
  };

  if (isLoading && !produtos.length) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center py-10"><div className="text-center"><svg className="animate-spin h-10 w-10 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-xl text-gray-500 mt-4">A carregar produtos...</p></div></div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col">
        <UserHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><p className="text-xl text-red-600 bg-red-100 p-4 rounded-md shadow">{error}</p></div>
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
            {redeemMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <XCircleIcon className="h-5 w-5 text-red-500" />}
            <span>{redeemMessage.text}</span>
          </div>
        )}

        <div className="mb-8 p-5 sm:p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Pesquisar por nome..." className="form-input pl-10 w-full !py-2.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px]">
            <select className="form-select w-full !py-2.5" value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} >
              <option value="">Todas as Categorias</option>
              {categorias.map((cat) => ( <option key={cat.idTipoProduto} value={cat.idTipoProduto.toString()}>{cat.tipoProduto}</option> ))}
            </select>
          </div>
        </div>

        {filteredProdutos.length > 0 ? (
          <div className="relative group/productsection">
            {filteredProdutos.length > 3 && (
              <>
                <button onClick={() => scrollProducts('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 shadow-lg -ml-3 sm:-ml-4 transition-all opacity-0 group-hover/productsection:opacity-100 focus:opacity-100" aria-label="Scroll Left"><ChevronLeftIcon className="h-6 w-6 text-gray-700" /></button>
                <button onClick={() => scrollProducts('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 shadow-lg -mr-3 sm:-mr-4 transition-all opacity-0 group-hover/productsection:opacity-100 focus:opacity-100" aria-label="Scroll Right"><ChevronRightIcon className="h-6 w-6 text-gray-700" /></button>
              </>
            )}
            <div ref={productsContainerRef} className="flex overflow-x-auto py-4 space-x-6 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {filteredProdutos.map((produto) => {
                const imageUrl = produto.imagemProduto;
                return (
                  <div key={produto.idProduto} className="flex-shrink-0 w-60 sm:w-64 bg-white rounded-xl shadow-lg flex flex-col group/card transition-all duration-300 ease-in-out hover:shadow-2xl" style={{ scrollSnapAlign: 'start' }}>
                    <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-t-xl overflow-hidden">
                      {imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? (
                        <img src={imageUrl} alt={produto.nomeProduto} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                      ) : ( <div className="w-full h-full flex items-center justify-center text-gray-400"><PlaceholderPhotoIcon className="h-16 w-16" /></div> )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <h3 className="text-base sm:text-md font-semibold text-gray-800 truncate group-hover/card:text-green-600 transition-colors" title={produto.nomeProduto}>{produto.nomeProduto}</h3>
                      {produto.Estabelecimento && (<p className="text-xs text-gray-500 mt-0.5 truncate" title={produto.Estabelecimento.nomeEstabelecimento}><span className="font-medium">Estab:</span> {produto.Estabelecimento.nomeEstabelecimento}</p>)}
                      <p className="text-xs text-purple-600 mt-0.5 truncate" title={produto.tipoProduto?.tipoProduto}><span className="font-medium">Cat:</span> {produto.tipoProduto?.tipoProduto || 'N/A'}</p>
                      <p className="text-lg font-bold text-green-600 mt-2 mb-3">{produto.precoProduto} <span className="text-sm font-normal text-gray-500">Pontos</span></p>
                      <button onClick={() => handleRedeem(produto.idProduto, produto.nomeProduto, produto.precoProduto)} className={`py-2 px-4 rounded-md text-white font-semibold text-sm w-full flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isRedeeming === produto.idProduto ? 'bg-green-700 cursor-not-allowed opacity-75' : 'bg-green-600 hover:bg-green-700'}`} disabled={isRedeeming === produto.idProduto}>
                        {isRedeeming === produto.idProduto ? (
                          <><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>A Redimir...</span></>
                        ) : (
                          <><ShoppingCartIcon className="h-5 w-5 mr-1.5" /><span>Redimir</span></>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* CORREÇÃO: Removido o fragmento desnecessário que envolvia a paginação */}
            {totalPages > 1 && filteredProdutos.length > 0 && (
                <div className="mt-10 flex justify-center items-center space-x-1 sm:space-x-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="px-3 py-2 sm:px-4 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">Anterior</button>
                    {renderPaginationButtons()}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="px-3 py-2 sm:px-4 border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">Próxima</button>
                </div>
            )}
          </div> // Fechamento do div que engloba a lista de produtos e a paginação
        ) : (
          !isLoading && ( 
            <div className="text-center py-16 bg-white rounded-lg shadow-md mt-8">
              <TagIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum produto encontrado</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedCategoria 
                  ? "Tente alterar os termos da sua pesquisa ou o filtro de categoria." 
                  : "Parece que não há produtos disponíveis na sua vizinhança no momento."}
              </p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};