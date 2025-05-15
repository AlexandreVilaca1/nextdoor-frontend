// src/features/tasksCreation/CreateTaskModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { CreateTaskPayload, categoriaTarefa } from './taskCreationTypes';
import { createTask, fetchCategories } from './taskCreationService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: any) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [nomeTarefa, setNomeTarefa] = useState('');
  const [descricaoTarefa, setDescricaoTarefa] = useState('');
  const [dataInicio, setDataInicio] = useState(''); 
  const [dataFim, setDataFim] = useState('');   
  const [categoriaId, setCategoriaId] = useState<number | string>('');
  const [categories, setCategories] = useState<categoriaTarefa[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true);
      fetchCategories()
        .then(setCategories)
        .catch(err => {
          console.error("Failed to load categories", err);
          setError("Falha ao carregar categorias. Tente novamente.");
        })
        .finally(() => setIsLoadingCategories(false));
      
      setNomeTarefa('');
      setDescricaoTarefa('');
      setDataInicio(''); 
      setDataFim(''); 
      setCategoriaId('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomeTarefa.trim()) {
        setError("O nome da tarefa é obrigatório.");
        return;
    }
    if (!descricaoTarefa.trim()) {
        setError("A descrição da tarefa é obrigatória.");
        return;
    }
    if (!dataInicio) { 
        setError("A data de início é obrigatória.");
        return;
    }
    if (!dataFim) { 
        setError("A data de fim é obrigatória.");
        return;
    }
    if (!categoriaId) {
        setError("Por favor, selecione uma categoria.");
        return;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
        setError("A data de início deve ser anterior ou igual à data de fim.");
        return;
    }


    setIsSubmitting(true);

    const payload: CreateTaskPayload = {
      nomeTarefa: nomeTarefa.trim(),
      descricaoTarefa: descricaoTarefa.trim(),
      categoriaTarefaidCategoriaTarefa: Number(categoriaId),
      dataInicio: dataInicio, 
      dataFim: dataFim,     
    };

    try {
      const newTask = await createTask(payload);
      onTaskCreated(newTask);
      onClose();
    } catch (err: any) {
      console.error("Failed to create task", err);
      setError(err.message || "Failed to create task. Verify your date and points.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 z-50 bg-opacity-20 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-[#4CAF4F]">Criar Nova Tarefa</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nomeTarefa" className="block text-sm font-medium text-gray-700 mb-1">Nome da Tarefa</label>
            <input
              type="text"
              id="nomeTarefa"
              value={nomeTarefa}
              onChange={(e) => setNomeTarefa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4CAF4F] focus:border-[#4CAF4F]"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="descricaoTarefa" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              id="descricaoTarefa"
              value={descricaoTarefa}
              onChange={(e) => setDescricaoTarefa(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4CAF4F] focus:border-[#4CAF4F]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
              <input
                type="date"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4CAF4F] focus:border-[#4CAF4F]"
                required 
              />
            </div>
            <div>
              <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
              <input
                type="date"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4CAF4F] focus:border-[#4CAF4F]"
                required 
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            {isLoadingCategories ? <p className="text-sm text-gray-500">A carregar categorias...</p> : (
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4CAF4F] focus:border-[#4CAF4F] bg-white"
                required 
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.idCategoriaTarefa} value={cat.idCategoriaTarefa}>
                    {cat.categoriaTarefa} ({cat.pontosCategoria} pontos)
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingCategories}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4CAF4F] rounded-md hover:bg-[#3e8e41] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF4F] disabled:opacity-50"
            >
              {isSubmitting ? 'A Criar...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;