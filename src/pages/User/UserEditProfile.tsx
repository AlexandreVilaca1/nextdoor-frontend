import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import { UserHeader } from './UserHeader'; 
import { Footer } from '../../components/Footer'; 
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import "../../styles.css"; 

interface ProfileFormData {
  nomeUtilizador: string;
  emailUtilizador: string;
  dataNascimento: string; 
}

interface UserDataFromAPI {
  idUtilizador: number; 
  nomeUtilizador: string;
  emailUtilizador?: string;
  dataNascimento?: string; 
  pontosUtilizador?: number;
  comprovativoResidencia?: string;
  tipoUtilizadoridTipoUtilizador?: number;
  Vizinhanca?: { idVizinhanca: number; nomeFreguesia: string };
  Endereco?: {
    idEndereco: number;
    numeroPorta: string;
    rua: string;
    codigoPostal: string;
    freguesia: string;
    distrito: string;
  };
}

export const UserEditProfile: React.FC = () => {
  const navigate = useNavigate();

  const [currentUserData, setCurrentUserData] = useState<UserDataFromAPI | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    nomeUtilizador: '',
    emailUtilizador: '',
    dataNascimento: '',
  });

  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const token = Cookies.get('jwt'); 
      if (!token) {
        setError('Autenticação necessária. Por favor, faça login.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<{ user: UserDataFromAPI }>( 
          'http://localhost:3000/api/users/profile', 
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        if (response.data && response.data.user) {
          const user = response.data.user;
          setCurrentUserData(user); 

          const profileDataForForm: ProfileFormData = {
            nomeUtilizador: user.nomeUtilizador || '',
            emailUtilizador: user.emailUtilizador || '',
            dataNascimento: user.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : '',
          };
          setFormData(profileDataForForm); 
          setInitialData(profileDataForForm); 
        } else {
          setError('Não foi possível carregar os dados do perfil (resposta inesperada da API).');
        }
      } catch (err: any) {
        console.error("UserEditProfile: Erro ao buscar dados do perfil:", err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError('Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.');
            Cookies.remove('jwt'); 
          } else if (err.response.data && err.response.data.error) {
            setError(`Erro da API: ${err.response.data.error}`);
          } else {
            setError('Falha ao carregar dados do perfil. Verifique sua conexão ou tente mais tarde.');
          }
        } else {
          setError('Ocorreu um erro desconhecido ao carregar o perfil.');
        }
      } finally {
        setIsLoading(false); 
      }
    };

    fetchCurrentUserData();
  }, [navigate]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!currentUserData || !currentUserData.idUtilizador) {
      setError("Não foi possível identificar o usuário para atualização. Por favor, tente recarregar a página.");
      return;
    }

    setIsSubmitting(true); 
    setError(null);
    setSuccessMessage(null);

    const changedData: Partial<ProfileFormData> = {};
    if (initialData) {
      (Object.keys(formData) as Array<keyof ProfileFormData>).forEach(key => {
        if (formData[key] !== initialData[key]) {
          changedData[key] = formData[key];
        }
      });
    }

    if (Object.keys(changedData).length === 0) {
      setSuccessMessage("Nenhuma alteração foi detectada.");
      setIsSubmitting(false);
      return;
    }

    const token = Cookies.get('jwt'); 
    if (!token) {
        setError('Sua sessão expirou. Por favor, faça login novamente para salvar as alterações.');
        setIsSubmitting(false);
        return;
    }

    try {
      const userId = currentUserData.idUtilizador; 
      const response = await axios.patch(`http://localhost:3000/api/users/edit/${userId}`, 
        changedData, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      if (response.data) { 
        setSuccessMessage('Perfil atualizado com sucesso! A página será recarregada em breve.');

        if (response.data.user) {
          const updatedUser = response.data.user as UserDataFromAPI;
          setCurrentUserData(updatedUser); 

          const updatedProfileDataForForm: ProfileFormData = {
            nomeUtilizador: updatedUser.nomeUtilizador || '',
            emailUtilizador: updatedUser.emailUtilizador || '',
            dataNascimento: updatedUser.dataNascimento ? new Date(updatedUser.dataNascimento).toISOString().split('T')[0] : '',
          };
          setFormData(updatedProfileDataForForm); 
          setInitialData(updatedProfileDataForForm); 
        }

        setTimeout(() => {
          window.location.reload(); 
        }, 2000); 
      }
    } catch (err: any) {
      console.error("UserEditProfile: Erro ao atualizar perfil:", err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
            setError('Sua sessão expirou ou você não tem permissão para esta ação. Por favor, faça login novamente.');
            Cookies.remove('jwt'); 
        } else if (err.response.data && err.response.data.error) {
            setError(`Erro da API: ${err.response.data.error}`);
        } else {
            setError('Falha ao atualizar o perfil. Verifique os dados ou tente mais tarde.');
        }
      } else {
        setError('Ocorreu um erro desconhecido ao atualizar o perfil.');
      }
      setIsSubmitting(false); 
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserHeader />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-6 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Editar Meu Perfil</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Mensagem de Sucesso */}
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md" role="alert">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
                    <p className="font-medium">Sucesso!</p>
                  </div>
                  <p className="text-sm mt-1">{successMessage}</p>
                </div>
              )}
              {/* Mensagem de Erro */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-600" />
                    <p className="font-medium">Erro!</p>
                  </div>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="nomeUtilizador" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nomeUtilizador"
                  id="nomeUtilizador"
                  value={formData.nomeUtilizador}
                  onChange={handleChange}
                  required
                  className="form-input w-full !py-2.5 shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 rounded-md"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="emailUtilizador" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="emailUtilizador"
                  id="emailUtilizador"
                  value={formData.emailUtilizador}
                  onChange={handleChange}
                  required
                  className="form-input w-full !py-2.5 shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 rounded-md"
                  disabled={isSubmitting}
                />
              </div>

              {/* Campo Data de Nascimento */}
              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  id="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  required
                  className="form-input w-full !py-2.5 shadow-sm focus:ring-green-500 focus:border-green-500 border-gray-300 rounded-md"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Botão de Submissão */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !currentUserData?.idUtilizador}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                  Salvar Alterações                  
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};