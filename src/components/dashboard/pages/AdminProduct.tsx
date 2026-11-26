import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { Sidebar } from '../Sidebar';
import { DashboardHeader } from '../DashboardHeader';
import Cookies from 'js-cookie';
import {
  EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, PhotoIcon, TagIcon,
  BuildingStorefrontIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, XCircleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const token = Cookies.get('jwt');
const ITEMS_PER_PAGE = 4;

// --- Interfaces ---
interface EstabelecimentoInfo {
  idEstabelecimento?: number;
  nomeEstabelecimento: string;
}
interface EstabelecimentoLista {
  idEstabelecimento: number;
  nomeEstabelecimento: string;
}
interface TipoProdutoInfo {
  idTipoProduto?: number;
  tipoProduto: string;
}
interface TipoProdutoLista {
  idTipoProduto: number;
  nomeTipoProduto: string;
}
interface EstadoProdutoInfo {
  idEstadoProduto?: number;
  estadoProduto: string;
}
interface EstadoProdutoLista {
  idEstadoProduto: number;
  nomeEstado: string;
}
interface ProdutoAPI {
  idProduto: number;
  nomeProduto: string;
  precoProduto: number;
  descricaoProduto: string;
  imagemProduto?: string;
  stockProduto: number;
  tipoProdutoidTipoProduto: number;
  estadoProdutoidEstadoProduto: number;
  EstabelecimentoidEstabelecimento: number;
  Estabelecimento?: EstabelecimentoInfo;
  tipoProduto?: TipoProdutoInfo;
  estadoProduto?: EstadoProdutoInfo;
}
interface ProductFormState {
  nomeProduto?: string;
  precoProduto?: number;
  descricaoProduto?: string;
  imagemProduto?: string;
  stockProduto?: number;
  tipoProdutoId?: number;
  estadoProdutoidEstadoProduto?: number;
  estabelecimentoId?: number;
}

export const AdminProduct = () => {
  const [produtos, setProdutos] = useState<ProdutoAPI[]>([]);
  const [tiposProdutoLista, setTiposProdutoLista] = useState<TipoProdutoLista[]>([]);
  const [estadosProdutoLista, setEstadosProdutoLista] = useState<EstadoProdutoLista[]>([]);
  const [estabelecimentosLista, setEstabelecimentosLista] = useState<EstabelecimentoLista[]>([]);

  const [currentProduct, setCurrentProduct] = useState<ProductFormState>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstabelecimentoId, setSelectedEstabelecimentoId] = useState<string>('');
  const [selectedTipoProdutoId, setSelectedTipoProdutoId] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);

  const getFullImageUrl = useCallback((imagePath?: string): string | null => {
    if (!imagePath || imagePath.trim() === "") return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:3000${imagePath}`;
  }, []);

  const handleApiError = useCallback((err: any, defaultMessage: string) => {
    console.error("API Error in AdminProduct:", defaultMessage, err.response?.data || err.message || err);
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;
      if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data;
        const errorDetailsText = errorData.details ? ` Detalhes: ${Array.isArray(errorData.details) ? errorData.details.map((d: any) => d.message || d.msg || JSON.stringify(d)).join(', ') : JSON.stringify(errorData.details)}` : '';
        const mainErrorText = errorData.error || errorData.message || (typeof errorData === 'string' ? errorData : defaultMessage);
        errorMessage = `${mainErrorText}${errorDetailsText}`;
      } else if (axiosError.request) {
        errorMessage = "Erro de rede ou servidor não respondeu. Tente novamente.";
      } else {
        errorMessage = `Erro desconhecido: ${axiosError.message || defaultMessage.toLowerCase()}.`;
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    setMessage({ type: 'error', text: errorMessage });
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Sessão inválida. Por favor, faça login novamente.' });
      return;
    }
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [productsRes, typesRes, statesRes, establishmentsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/products/all`, config),
        axios.get(`http://localhost:3000/api/product-types/`, config),
        axios.get(`http://localhost:3000/api/product-status/`, config),
        axios.get(`http://localhost:3000/api/establishments/all`, config),
      ]);
      setProdutos(productsRes.data.products || []);
      setTiposProdutoLista(typesRes.data.productTypes || []);
      setEstadosProdutoLista(statesRes.data.productStatus || []);
      setEstabelecimentosLista(establishmentsRes.data.establishments || []);
    } catch (err) {
      handleApiError(err, 'Erro fatal ao carregar dados das listas.');
      setProdutos([]); setTiposProdutoLista([]); setEstadosProdutoLista([]); setEstabelecimentosLista([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumericOrIdField = ['precoProduto', 'stockProduto', 'tipoProdutoId', 'estadoProdutoidEstadoProduto', 'estabelecimentoId'].includes(name);
    setCurrentProduct(prev => ({
      ...prev,
      [name]: (type === 'number' || (isNumericOrIdField && value !== '')) ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor, selecione um ficheiro de imagem válido (ex: JPG, PNG, GIF, WEBP).' });
        e.target.value = ''; return;
      }
      if (file.size > 5 * 1024 * 1024) { 
        setMessage({ type: 'error', text: 'O ficheiro da imagem é muito grande. Máximo permitido: 5MB.' });
        e.target.value = ''; return;
      }
      setSelectedImageFile(file);
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetFormAndImageState = () => {
    setCurrentProduct({});
    setSelectedImageFile(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    const fileInput = document.getElementById('imagemProdutoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleOpenAddForm = () => {
    setIsEditing(false); setEditingProductId(null);
    resetFormAndImageState();
    setShowFormModal(true); setMessage(null);
  };

  const handleOpenEditForm = (produto: ProdutoAPI) => {
    setIsEditing(true); setEditingProductId(produto.idProduto);
    setCurrentProduct({
      nomeProduto: produto.nomeProduto,
      precoProduto: produto.precoProduto,
      descricaoProduto: produto.descricaoProduto,
      stockProduto: produto.stockProduto,
      tipoProdutoId: produto.tipoProdutoidTipoProduto,
      estadoProdutoidEstadoProduto: produto.estadoProdutoidEstadoProduto,
      estabelecimentoId: produto.EstabelecimentoidEstabelecimento,
      imagemProduto: produto.imagemProduto || '',
    });
    setSelectedImageFile(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(getFullImageUrl(produto.imagemProduto));
    const fileInput = document.getElementById('imagemProdutoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setShowFormModal(true); setMessage(null);
  };

  const handleFormSubmit = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Autenticação expirada. Faça login novamente.' });
      setIsSubmitting(false); return;
    }
    const { nomeProduto, precoProduto, descricaoProduto, stockProduto, tipoProdutoId, estadoProdutoidEstadoProduto, estabelecimentoId } = currentProduct;
    if (!nomeProduto || nomeProduto.trim() === '' || precoProduto === undefined || precoProduto < 0 ||
      !descricaoProduto || descricaoProduto.trim() === '' || stockProduto === undefined || stockProduto < 0 || !Number.isInteger(stockProduto) ||
      !tipoProdutoId || !estadoProdutoidEstadoProduto || !estabelecimentoId) {
      setMessage({ type: 'error', text: 'Todos os campos marcados com * e Stock (inteiro >= 0) são obrigatórios.' });
      return;
    }
    setIsSubmitting(true); setMessage(null);
    const formData = new FormData();
    formData.append('nomeProduto', nomeProduto.trim());
    formData.append('precoProduto', String(precoProduto));
    formData.append('descricaoProduto', descricaoProduto.trim());
    formData.append('stockProduto', String(stockProduto));
    formData.append('tipoProdutoidTipoProduto', String(tipoProdutoId));
    formData.append('estadoProdutoidEstadoProduto', String(estadoProdutoidEstadoProduto));
    formData.append('EstabelecimentoidEstabelecimento', String(estabelecimentoId));

    if (selectedImageFile) {
      formData.append('imagemProdutoFile', selectedImageFile);
    } else if (isEditing && currentProduct.imagemProduto === "") {
      formData.append('imagemProduto', "");
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing && editingProductId) {
        await axios.patch(`http://localhost:3000/api/products/${editingProductId}`, formData, config);
        setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      } else {
        await axios.post(`http://localhost:3000/api/products`, formData, config);
        setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' });
      }
      setShowFormModal(false); resetFormAndImageState(); setIsEditing(false); setEditingProductId(null);
      fetchData();
    } catch (err) {
      handleApiError(err, `Erro ao ${isEditing ? 'atualizar' : 'adicionar'} produto.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduto = async (idProduto: number) => {
    if (!token) { setMessage({ type: 'error', text: 'Autenticação expirada.' }); return; }
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`http://localhost:3000/api/products/${idProduto}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ type: 'success', text: 'Produto excluído com sucesso.' });
      fetchData();
    } catch (err) {
      handleApiError(err, 'Erro ao excluir produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProdutos = useMemo(() => produtos.filter(produto =>
    produto.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedEstabelecimentoId === '' || produto.EstabelecimentoidEstabelecimento === Number(selectedEstabelecimentoId)) &&
    (selectedTipoProdutoId === '' || produto.tipoProdutoidTipoProduto === Number(selectedTipoProdutoId))
  ), [produtos, searchTerm, selectedEstabelecimentoId, selectedTipoProdutoId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleEstabelecimentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedEstabelecimentoId(e.target.value); setCurrentPage(1); };
  const handleTipoProdutoChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedTipoProdutoId(e.target.value); setCurrentPage(1); };
  const clearFilters = () => { setSearchTerm(''); setSelectedEstabelecimentoId(''); setSelectedTipoProdutoId(''); setCurrentPage(1); };

  const totalPages = Math.ceil(filteredProdutos.length / ITEMS_PER_PAGE);
  const currentItemsToDisplay = filteredProdutos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const handlePageChange = (pageNumber: number) => { if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber); };

  const getEstabelecimentoNomeFallback = (id?: number) => id ? estabelecimentosLista.find(e => e.idEstabelecimento === id)?.nomeEstabelecimento || `ID ${id}` : 'N/A';
  const getTipoProdutoNomeFallback = (id?: number) => id ? tiposProdutoLista.find(t => t.idTipoProduto === id)?.nomeTipoProduto || `ID ${id}` : 'N/A';
  const getEstadoProdutoNomeFallback = (id?: number) => id ? estadosProdutoLista.find(e => e.idEstadoProduto === id)?.nomeEstado || `ID ${id}` : 'N/A';

  if (!token && !isLoading) {
    return ( <div className="flex min-h-screen bg-gray-100"> <Sidebar /> <div className="flex-1 flex flex-col"> <DashboardHeader /> <div className="flex-1 flex items-center justify-center p-6"> <div className="bg-white p-8 rounded-lg shadow-xl text-center"> <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" /> <h3 className="text-xl font-semibold text-gray-800 mb-2">Acesso Negado</h3> <p className="text-gray-600">{message?.text || "É necessária autenticação."}</p> </div> </div> </div> </div> );
  }
  if (isLoading && !produtos.length) {
    return ( <div className="flex min-h-screen bg-gray-100"> <Sidebar /> <div className="flex-1 flex flex-col"> <DashboardHeader /> <div className="flex-1 flex items-center justify-center"> <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle> <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path> </svg> <p className="ml-3 text-xl text-gray-500">A carregar dados...</p> </div> </div> </div> );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestão de Produtos</h2>
            <button className="btn-primary px-5 py-2.5 text-sm flex items-center" onClick={handleOpenAddForm}> <ArrowUpTrayIcon className="w-5 h-5 mr-2" />Adicionar Produto </button>
          </div>
          {message && ( <div className={`mb-4 p-3 rounded-md text-sm shadow-sm flex justify-between items-center ${message.type === 'error' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'}`}> <div className="flex items-center"> {message.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 inline mr-2 shrink-0" />} <span>{message.text}</span> </div> <button onClick={() => setMessage(null)} className="ml-4 text-lg font-bold hover:opacity-75 p-1 leading-none">×</button> </div> )}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div> <label htmlFor="searchNomeProduto" className="block text-sm font-medium text-gray-700 mb-1">Pesquisar por Nome</label> <div className="relative"> <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /> </div> <input type="text" id="searchNomeProduto" name="searchNomeProduto" className="form-input pl-10" placeholder="Ex: Café Expresso" value={searchTerm} onChange={handleSearchChange} /> </div> </div>
              <div> <label htmlFor="filterEstabelecimento" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estabelecimento</label> <select id="filterEstabelecimento" name="filterEstabelecimento" className="form-select" value={selectedEstabelecimentoId} onChange={handleEstabelecimentoChange} disabled={!estabelecimentosLista.length}> <option value="">Todos</option> {estabelecimentosLista.map(est => (<option key={est.idEstabelecimento} value={est.idEstabelecimento}>{est.nomeEstabelecimento}</option>))} </select> </div>
              <div> <label htmlFor="filterTipoProduto" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Tipo</label> <select id="filterTipoProduto" name="filterTipoProduto" className="form-select" value={selectedTipoProdutoId} onChange={handleTipoProdutoChange} disabled={!tiposProdutoLista.length}> <option value="">Todos</option> {tiposProdutoLista.map(tipo => (<option key={tipo.idTipoProduto} value={tipo.idTipoProduto}>{tipo.nomeTipoProduto}</option>))} </select> </div>
              <div className="mt-4 md:mt-0"> <button onClick={clearFilters} className="btn-secondary w-full flex items-center justify-center py-2.5" title="Limpar filtros"> <XCircleIcon className="h-5 w-5 mr-2" /> Limpar </button> </div>
            </div>
          </div>

          {showFormModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) setShowFormModal(false); }}>
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-6 border-b"> <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3> <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg> </button> </div>
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div> <label htmlFor="nomeProduto" className="form-label">Nome <span className="text-red-500">*</span></label> <input id="nomeProduto" type="text" name="nomeProduto" className="form-input" value={currentProduct.nomeProduto || ''} onChange={handleInputChange} required /> </div>
                    <div> <label htmlFor="precoProduto" className="form-label">Pontos <span className="text-red-500">*</span></label> <input id="precoProduto" type="number" name="precoProduto" step="any" min="0" className="form-input" value={currentProduct.precoProduto === undefined ? '' : currentProduct.precoProduto} onChange={handleInputChange} required /> </div>
                  </div>
                  <div> <label htmlFor="stockProduto" className="form-label">Stock <span className="text-red-500">*</span></label> <input id="stockProduto" type="number" name="stockProduto" min="0" step="1" className="form-input" value={currentProduct.stockProduto === undefined ? '' : currentProduct.stockProduto} onChange={handleInputChange} required /> </div>
                  <div> <label htmlFor="descricaoProduto" className="form-label">Descrição <span className="text-red-500">*</span></label> <textarea id="descricaoProduto" name="descricaoProduto" rows={3} className="form-input min-h-[80px]" value={currentProduct.descricaoProduto || ''} onChange={handleInputChange} required></textarea> </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                    <div> <label htmlFor="estabelecimentoId" className="form-label">Estabelecimento <span className="text-red-500">*</span></label> <select id="estabelecimentoId" name="estabelecimentoId" className="form-select" value={currentProduct.estabelecimentoId || ""} onChange={handleInputChange} required> <option value="" disabled>-- Selecione --</option> {estabelecimentosLista.map(est => <option key={est.idEstabelecimento} value={est.idEstabelecimento}>{est.nomeEstabelecimento}</option>)} </select> </div>
                    <div> <label htmlFor="tipoProdutoId" className="form-label">Tipo <span className="text-red-500">*</span></label> <select id="tipoProdutoId" name="tipoProdutoId" className="form-select" value={currentProduct.tipoProdutoId || ""} onChange={handleInputChange} required> <option value="" disabled>-- Selecione --</option> {tiposProdutoLista.map(tipo => <option key={tipo.idTipoProduto} value={tipo.idTipoProduto}>{tipo.nomeTipoProduto}</option>)} </select> </div>
                    <div> <label htmlFor="estadoProdutoidEstadoProduto" className="form-label">Estado <span className="text-red-500">*</span></label> <select id="estadoProdutoidEstadoProduto" name="estadoProdutoidEstadoProduto" className="form-select" value={currentProduct.estadoProdutoidEstadoProduto || ""} onChange={handleInputChange} required> <option value="" disabled>-- Selecione --</option> {estadosProdutoLista.map(estado => <option key={estado.idEstadoProduto} value={estado.idEstadoProduto}>{estado.nomeEstado}</option>)} </select> </div>
                  </div>
                  <div>
                    <label className="form-label">Imagem do Produto</label>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="shrink-0">
                            <span className="inline-block h-24 w-24 rounded-md overflow-hidden bg-gray-100 border">
                                {imagePreviewUrl ? ( <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23777'%3EPreview%3C/text%3E%3C/svg%3E"; }}/> ) : ( <PhotoIcon className="h-full w-full text-gray-300 p-4" /> )}
                            </span>
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="imagemProdutoFile" className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"> <ArrowUpTrayIcon className="h-5 w-5 inline mr-2"/> <span>{selectedImageFile ? 'Alterar Imagem' : (isEditing && currentProduct.imagemProduto && currentProduct.imagemProduto !== "" ? 'Alterar Imagem Existente' : 'Selecionar Imagem')}</span> <input id="imagemProdutoFile" name="imagemProdutoFile" type="file" className="sr-only" accept="image/jpeg, image/png, image/gif, image/webp, image/avif" onChange={handleImageFileChange} /> </label>
                            {selectedImageFile && ( <button type="button" onClick={() => { setSelectedImageFile(null); if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) { URL.revokeObjectURL(imagePreviewUrl); } setImagePreviewUrl(isEditing && currentProduct.imagemProduto ? getFullImageUrl(currentProduct.imagemProduto) : null); const fileInput = document.getElementById('imagemProdutoFile') as HTMLInputElement; if (fileInput) fileInput.value = ''; }} className="mt-2 sm:mt-0 sm:ml-3 btn-secondary-small" title="Cancelar seleção"> Cancelar Seleção </button> )}
                            {!selectedImageFile && isEditing && currentProduct.imagemProduto && currentProduct.imagemProduto !== "" && ( <button type="button" onClick={() => { setCurrentProduct(prev => ({ ...prev, imagemProduto: "" })); setImagePreviewUrl(null); }} className="mt-2 sm:mt-0 sm:ml-3 btn-warning-small" title="Remover imagem existente ao salvar"> Remover Imagem </button> )}
                            <p className="text-xs text-gray-500 mt-2">Max. 5MB. Tipos: PNG, JPG, GIF, WEBP, AVIF.</p>
                            {selectedImageFile && <p className="text-xs text-gray-600 mt-1 truncate" title={selectedImageFile.name}>Novo: {selectedImageFile.name}</p>}
                            {!selectedImageFile && isEditing && currentProduct.imagemProduto && currentProduct.imagemProduto !== "" && <p className="text-xs text-gray-500 mt-1">Atual: <a href={getFullImageUrl(currentProduct.imagemProduto) ?? '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ver</a></p>}
                            {!selectedImageFile && isEditing && currentProduct.imagemProduto === "" && <p className="text-xs text-orange-500 mt-1">Imagem existente será removida.</p>}
                        </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 space-y-reverse">
                    <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}> {isSubmitting ? (<span className="flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg> A processar... </span>) : (isEditing ? 'Salvar Alterações' : 'Adicionar Produto')} </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading && produtos.length > 0 && <div className="py-4 text-center text-gray-500">A atualizar lista...</div> }
          {!isLoading && !produtos.length && !message?.text && (<div className="py-10 text-center bg-white border rounded-lg shadow-sm"> <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" /> <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto registado</h3> <p className="mt-1 text-sm text-gray-500">Adicione um novo produto.</p> </div>)}
          {!isLoading && produtos.length > 0 && !currentItemsToDisplay.length && (<div className="py-10 text-center bg-white border rounded-lg shadow-sm"> <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400" /> <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto corresponde aos filtros.</h3> <p className="mt-1 text-sm text-gray-500">Ajuste ou limpe os filtros.</p> </div>)}

          {currentItemsToDisplay.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {currentItemsToDisplay.map(produto => {
                  const estadoDoProdutoVisivel = produto.estadoProdutoidEstadoProduto === 1;
                  const nomeDoEstado = getEstadoProdutoNomeFallback(produto.estadoProdutoidEstadoProduto);
                  const cardOpacity = estadoDoProdutoVisivel ? 'opacity-100' : 'opacity-60';
                  const displayImageUrl = getFullImageUrl(produto.imagemProduto);
                  const isValidImageUrl = typeof displayImageUrl === 'string';

                  return (
                    <div key={produto.idProduto} className={`bg-white rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl group ${cardOpacity}`}>
                      <div className="relative h-44 bg-gray-100 rounded-t-xl overflow-hidden">
                        {isValidImageUrl ? (
                          <img src={displayImageUrl}
                               alt={produto.nomeProduto}
                               className="w-full h-full object-contain" 
                               onError={(e) => {
                                   const imgTarget = e.target as HTMLImageElement;
                                   const parent = imgTarget.parentElement;
                                   if (parent && !parent.querySelector('.fallback-icon-placeholder')) { 
                                       imgTarget.style.display = 'none'; 
                                       const fallbackDiv = document.createElement('div');
                                       fallbackDiv.className = "fallback-icon-placeholder w-full h-full bg-gray-200 flex items-center justify-center text-gray-400";
                                       fallbackDiv.innerHTML = `<svg class="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`;
                                       parent.appendChild(fallbackDiv);
                                   }
                               }}/>
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"> <PhotoIcon className="h-16 w-16" /> </div>
                        )}
                        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full text-white ${estadoDoProdutoVisivel ? 'bg-green-500' : 'bg-red-500'} shadow`}> {estadoDoProdutoVisivel ? <EyeIcon className="h-4 w-4 inline mr-1" /> : <EyeSlashIcon className="h-4 w-4 inline mr-1" />} {nomeDoEstado} </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors truncate" title={produto.nomeProduto}>{produto.nomeProduto}</h3>
                        <p className="text-sm text-gray-700 mb-1 font-bold">{Number(produto.precoProduto).toFixed(0)} Pontos</p>
                        <p className="text-xs text-gray-600 mb-2">Stock: {produto.stockProduto}</p>
                        <p className="text-xs text-gray-500 mb-3 h-10 overflow-hidden leading-tight line-clamp-2" title={produto.descricaoProduto}>{produto.descricaoProduto}</p>
                        <div className="space-y-1.5 text-xs mb-3">
                          <div className="flex items-center text-gray-600" title={getEstabelecimentoNomeFallback(produto.EstabelecimentoidEstabelecimento)}> <BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" /> <span className="truncate">{getEstabelecimentoNomeFallback(produto.EstabelecimentoidEstabelecimento)}</span> </div>
                          <div className="flex items-center text-gray-600" title={getTipoProdutoNomeFallback(produto.tipoProdutoidTipoProduto)}> <TagIcon className="h-4 w-4 mr-1.5 text-purple-500 flex-shrink-0" /> <span className="truncate">{getTipoProdutoNomeFallback(produto.tipoProdutoidTipoProduto)}</span> </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-2 gap-2"> <button className="btn-edit-small" onClick={() => handleOpenEditForm(produto)}><PencilSquareIcon className="h-4 w-4 mr-1.5"/>Editar</button> <button className="btn-danger-small" onClick={() => handleDeleteProduto(produto.idProduto)} disabled={isSubmitting}><TrashIcon className="h-4 w-4 mr-1.5"/>Excluir</button> </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Paginação Melhorada */}
              {totalPages > 1 && currentItemsToDisplay.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg shadow-sm">
                    <div className="sm:hidden mb-2 sm:mb-0"> <p className="text-sm text-gray-700"> A mostrar <span className="font-medium">{Math.max(1, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProdutos.length)}</span> de <span className="font-medium">{filteredProdutos.length}</span> resultados </p> </div>
                    <div className="flex flex-1 justify-between sm:justify-end items-center w-full">
                    <div className="hidden sm:block"> <p className="text-sm text-gray-700"> A mostrar <span className="font-medium">{Math.max(1, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProdutos.length)}</span> de <span className="font-medium">{filteredProdutos.length}</span> resultados </p> </div>
                    <div className="sm:ml-auto">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="pagination-arrow-btn rounded-l-md" aria-label="Página Anterior"> <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" /> </button>
                        {(() => {
                            const pageNumbersToRender: (number | string)[] = [];
                            if (totalPages <= 1) return pageNumbersToRender;
                            const MAX_PAGES_SHOWN_AROUND_CURRENT = 1;
                            const TOTAL_VISIBLE_BUTTONS = 5;
                            if (totalPages <= TOTAL_VISIBLE_BUTTONS) { for (let i = 1; i <= totalPages; i++) pageNumbersToRender.push(i);
                            } else {
                                pageNumbersToRender.push(1);
                                let startPage = Math.max(2, currentPage - MAX_PAGES_SHOWN_AROUND_CURRENT);
                                let endPage = Math.min(totalPages - 1, currentPage + MAX_PAGES_SHOWN_AROUND_CURRENT);
                                if (currentPage - MAX_PAGES_SHOWN_AROUND_CURRENT <= 2) { endPage = Math.min(totalPages -1, 1 + (MAX_PAGES_SHOWN_AROUND_CURRENT * 2) + (currentPage <= 2 ? 1 : 0) ); }
                                else if (currentPage + MAX_PAGES_SHOWN_AROUND_CURRENT >= totalPages -1) { startPage = Math.max(2, totalPages - (MAX_PAGES_SHOWN_AROUND_CURRENT * 2) - (currentPage >= totalPages -1 ? 1: 0)  ); }
                                if (startPage > 2) { pageNumbersToRender.push('...'); }
                                for (let i = startPage; i <= endPage; i++) { if (i > 1 && i < totalPages) { pageNumbersToRender.push(i); } }
                                if (endPage < totalPages - 1) { pageNumbersToRender.push('...'); }
                                pageNumbersToRender.push(totalPages);
                            }
                            const uniquePageNumbers = [...new Set(pageNumbersToRender)];
                            return uniquePageNumbers.map((page, index) =>
                                typeof page === 'number' ? ( <button key={`page-${page}`} onClick={() => handlePageChange(page)} disabled={isLoading} aria-current={currentPage === page ? 'page' : undefined} className={currentPage === page ? "pagination-number-btn-active" : "pagination-number-btn"}> {page} </button>
                                ) : (<span key={`ellipsis-${page}-${index}`} className="pagination-ellipsis-btn">{page}</span>)
                            );
                        })()}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="pagination-arrow-btn rounded-r-md" aria-label="Próxima Página"> <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> </button>
                        </nav>
                    </div>
                    </div>
                </div>
                )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};