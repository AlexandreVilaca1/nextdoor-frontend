import { API_URL } from "../../../config/api";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { Sidebar } from '../Sidebar'; 
import { DashboardHeader } from '../DashboardHeader'; 
import Cookies from 'js-cookie';
import {
  TagIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronLeftIcon, ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  XCircleIcon as ClearIcon
} from '@heroicons/react/24/outline';
import "../../../styles.css";

const token = Cookies.get('jwt');
const ITEMS_PER_PAGE = 10;

// --- Interfaces ---
interface TaskCategoryFromAPI {
  idCategoriaTarefa: number;
  categoriaTarefa: string; 
  pontosCategoria?: number;
}

interface TaskCategoryFormState {
  categoriaTarefa?: string;
  pontosCategoria?: number;
}

// Ajustado para esperar um array diretamente ou um objeto com a propriedade 'categories'
interface GetAllCategoriesResponse {
  categories?: TaskCategoryFromAPI[]; 
  totalItems?: number; 
  totalPages?: number;
  currentPage?: number;
}

export const AdminCategory: React.FC = () => { 
  const [allCategories, setAllCategories] = useState<TaskCategoryFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);

  const [currentCategory, setCurrentCategory] = useState<TaskCategoryFormState>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const handleApiError = useCallback((err: any, defaultMessage: string) => {
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
      } else { 
        errorMessageText = axiosError.message || defaultMessage;
      }
    }
    
    if (showFormModal) { 
        setFormMessage({ text: errorMessageText, type: 'error' });
    } else {
        setError(errorMessageText);
    }
  }, [showFormModal]); 

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null); 
    setFormMessage(null); 
    if (!token) {
      setError('Administrador não autenticado.'); setIsLoading(false); return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get<GetAllCategoriesResponse | TaskCategoryFromAPI[]>(
        `${API_URL}/api/categories/`, 
        config
      );
      
      let categoriesData: TaskCategoryFromAPI[] = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && (response.data as GetAllCategoriesResponse).categories) {
        categoriesData = (response.data as GetAllCategoriesResponse).categories ?? [];
      }
      const validCategories = categoriesData.filter(cat => typeof cat.categoriaTarefa === 'string');
      setAllCategories(validCategories);

    } catch (err) {
      handleApiError(err, 'Erro ao carregar categorias de tarefa.');
      setAllCategories([]); 
    } finally {
      setIsLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCategories = useMemo(() => {
    return allCategories
      .filter(cat => {
        const nomeMatch = cat.categoriaTarefa && typeof cat.categoriaTarefa === 'string' 
          ? cat.categoriaTarefa.toLowerCase().includes(searchTerm.toLowerCase()) 
          : false;
        return nomeMatch ;
      })
      .sort((a,b) => (a.categoriaTarefa || '').localeCompare(b.categoriaTarefa || '')); 
  }, [allCategories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const currentItemsToDisplay = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCategories, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
        setCurrentPage(1);
    } else if (filteredCategories.length === 0 && currentPage !== 1) { 
        setCurrentPage(1);
    }
  }, [filteredCategories.length, totalPages, currentPage]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentCategory(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value 
    }));
    setFormMessage(null); 
  };

  const handleOpenAddForm = () => {
    setIsEditing(false); setEditingCategoryId(null); setCurrentCategory({ categoriaTarefa: '', pontosCategoria: 0 }); 
    setShowFormModal(true); setFormMessage(null);
  };

  const handleOpenEditForm = (category: TaskCategoryFromAPI) => {
    setIsEditing(true); setEditingCategoryId(category.idCategoriaTarefa);
    setCurrentCategory({
      categoriaTarefa: category.categoriaTarefa,
      pontosCategoria: category.pontosCategoria === undefined ? 0 : category.pontosCategoria,
    });
    setShowFormModal(true); setFormMessage(null);
  };

  const handleFormSubmit = async () => {
    const { categoriaTarefa, pontosCategoria } = currentCategory;

    if (!categoriaTarefa || categoriaTarefa.trim() === '') {
      setFormMessage({ type: 'error', text: 'O nome da categoria é obrigatório.' });
      return;
    }
    if (pontosCategoria !== undefined && (isNaN(pontosCategoria) || Number(pontosCategoria) < 0)) {
        setFormMessage({ type: 'error', text: 'Pontos da categoria devem ser um número não negativo.' });
        return;
    }

    setIsSubmitting(true); setFormMessage(null);
    
    const payload: TaskCategoryFormState = {
      categoriaTarefa: categoriaTarefa.trim(),
      pontosCategoria: pontosCategoria !== undefined ? Number(pontosCategoria) : 0, 
    };
    
    const finalPayload: Partial<TaskCategoryFormState> = {};
    Object.keys(payload).forEach(keyStr => {
        const key = keyStr as keyof TaskCategoryFormState;
        if (payload[key] !== undefined) {
            (finalPayload as any)[key] = payload[key];
        }
    });
  
    if (finalPayload.pontosCategoria === 0 && currentCategory.pontosCategoria === undefined) {

    }


    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const urlBase = `${API_URL}/api/categories/`; 
      if (isEditing && editingCategoryId) {
        await axios.patch(`${urlBase}${editingCategoryId}`, finalPayload, config);
        setFormMessage({ type: 'success', text: 'Categoria atualizada com sucesso!' });
      } else {
        await axios.post(urlBase, finalPayload, config);
        setFormMessage({ type: 'success', text: 'Categoria adicionada com sucesso!' });
      }
      setTimeout(() => { 
        setShowFormModal(false); setCurrentCategory({});
        setIsEditing(false); setEditingCategoryId(null);
        fetchData(); 
        setFormMessage(null); 
      }, 1500);
    } catch (err) {
      handleApiError(err, `Erro ao ${isEditing ? 'atualizar' : 'adicionar'} categoria.`);
      
      setIsSubmitting(false); 
    } 
  };

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
        if (currentPage > halfPagesToShow + 2 && totalPages > maxPagesToShow) pageNumbers.push(1);
        if (currentPage > halfPagesToShow + 3 && totalPages > maxPagesToShow +1) pageNumbers.push('...');
        let startPage = Math.max(1, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages, currentPage + halfPagesToShow);
        if (currentPage <= halfPagesToShow) { startPage = 1; endPage = Math.min(totalPages, maxPagesToShow -1 < totalPages ? maxPagesToShow -1 : totalPages); if(totalPages > maxPagesToShow && endPage < totalPages -1) endPage = maxPagesToShow -2 ; }
        else if (currentPage >= totalPages - halfPagesToShow) { startPage = Math.max(1, totalPages - (maxPagesToShow -2) > 1 ? totalPages - (maxPagesToShow -2) : 1); endPage = totalPages; }
        for (let i = startPage; i <= endPage; i++) { if(!pageNumbers.includes(i)) pageNumbers.push(i); }
        if (currentPage < totalPages - halfPagesToShow - 2 && totalPages > maxPagesToShow +1 && endPage < totalPages -1) pageNumbers.push('...');
        if (totalPages > 1 && !pageNumbers.includes(totalPages) && endPage < totalPages) pageNumbers.push(totalPages);
    }
    return [...new Set(pageNumbers)];
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto"> <DashboardHeader />
        <main className="p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center"><TagIcon className="h-8 w-8 mr-3 text-purple-600" />Gestão de Categorias de Tarefa</h2>
            <button className="btn-primary mt-4 sm:mt-0" onClick={handleOpenAddForm}><PlusIcon className="h-5 w-5 mr-2" />Adicionar Categoria</button>
          </div>

          {(formMessage) && (
            <div className={`mb-6 p-4 text-center rounded-md shadow text-sm flex items-center justify-center gap-2 ${formMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
              <InformationCircleIcon className="h-5 w-5" />
              <span>{formMessage.text}</span>
            </div>
          )}
          {error && !formMessage && (
             <div className={`mb-6 p-4 text-center rounded-md shadow text-sm flex items-center justify-center gap-2 bg-red-100 text-red-700 border border-red-300`}>
                <InformationCircleIcon className="h-5 w-5" />
                <span>{error}</span>
            </div>
          )}


          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
                <div><label htmlFor="searchcategoriaTarefa" className="form-label">Pesquisar por Nome/Descrição</label><div className="relative mt-1"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div><input type="text" id="searchcategoriaTarefa" className="form-input pl-10" placeholder="Nome ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div></div>
                <div className="mt-4 md:mt-0"><button onClick={() => {setSearchTerm(''); setCurrentPage(1);}} className="btn-secondary w-full flex items-center justify-center py-2.5" title="Limpar pesquisa"><ClearIcon className="h-5 w-5 mr-2" />Limpar Pesquisa</button></div>
            </div>
          </div>

          {showFormModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn" onClick={() => setShowFormModal(false)}>
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-modalFadeInScale" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 mb-6 border-b"><h3 className="text-xl font-semibold text-gray-800">{isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h3><button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><XMarkIcon className="h-6 w-6" /></button></div>
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-5">
                  <div><label htmlFor="categoriaTarefa" className="form-label">Nome <span className="text-red-500">*</span></label><input id="categoriaTarefa" type="text" name="categoriaTarefa" className="form-input" value={currentCategory.categoriaTarefa || ''} onChange={handleInputChange} required /></div>
                  <div><label htmlFor="pontosCategoria" className="form-label">Pontos</label><input id="pontosCategoria" type="number" name="pontosCategoria" min="0" step="1" className="form-input" value={currentCategory.pontosCategoria === undefined ? '' : currentCategory.pontosCategoria} onChange={handleInputChange} placeholder="Ex: 10 (inteiro)"/></div>
                  <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                    <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>{isSubmitting ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>A processar...</span>) : (isEditing ? 'Salvar Alterações' : 'Adicionar Categoria')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading && currentItemsToDisplay.length === 0 && allCategories.length > 0 && ( <div className="py-4 text-center text-gray-500">A aplicar filtros...</div> )}
          
          {!isLoading && filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200"><TagIcon className="mx-auto h-16 w-16 text-gray-300" /><h3 className="mt-3 text-lg font-semibold text-gray-700">Nenhuma categoria encontrada</h3><p className="mt-1 text-sm text-gray-500">{searchTerm ? "Nenhuma categoria corresponde à sua pesquisa." : "Comece por adicionar uma nova categoria."}</p></div>
          )}

          {currentItemsToDisplay.length > 0 && (
            <>
              <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th></tr></thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItemsToDisplay.map(cat => (
                      <tr key={cat.idCategoriaTarefa} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.categoriaTarefa}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.pontosCategoria !== undefined ? cat.pontosCategoria : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button onClick={() => handleOpenEditForm(cat)} className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1" title="Editar"><PencilSquareIcon className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="btn-secondary p-2 rounded-full disabled:opacity-50" aria-label="Página Anterior"><ChevronLeftIcon className="h-5 w-5"/></button>
                    {renderPageNumbers().map((page, index) => (typeof page === 'number' ? (<button key={index} onClick={() => handlePageChange(page)} disabled={isLoading} className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'btn-primary' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}>{page}</button>) : (<span key={index} className="px-1.5 py-1.5 text-sm text-gray-500">...</span>)))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="btn-secondary p-2 rounded-full disabled:opacity-50" aria-label="Próxima Página"><ChevronRightIcon className="h-5 w-5"/></button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};