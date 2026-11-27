import { API_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios"; 
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Cookies from 'js-cookie';

type UserTypeChartData = {
  name: string;  
  value: number; 
};

interface ApiUser {
  idUtilizador: number;
  tipoUtilizador?: {
    idTipoUtilizador: number;
    tipoUtilizador?: string; 
  };
  tipoUtilizadoridTipoUtilizador?: number;
}

interface FetchUsersApiResponse {
  message?: string;
  users?: ApiUser[]; 
  user?: ApiUser[];  
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"]; 

export const GraphUsers = () => {
  const [chartData, setChartData] = useState<UserTypeChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get('jwt');

  useEffect(() => {
    const fetchDataForChart = async () => {
      setIsLoading(true);
      setError(null);
      setChartData([]); 

      if (!token) {
        console.warn("GraphUsers: Token não encontrado.");
        setError("Autenticação necessária para carregar o gráfico.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<FetchUsersApiResponse>(`${API_URL}/api/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usersFromApi = response.data.users || response.data.user || [];

        if (usersFromApi.length === 0) {
          console.warn("GraphUsers: Nenhum utilizador retornado pela API.");
          setIsLoading(false);
          return;
        }

        // Contagem dos tipos de utilizador
        let adminCount = 0;
        let vizinhoCount = 0;

        usersFromApi.forEach((user: ApiUser) => {
          const tipoId = user.tipoUtilizador?.idTipoUtilizador || user.tipoUtilizadoridTipoUtilizador;
          if (tipoId === 1) {
            adminCount++;
          } else if (tipoId === 2) {
            vizinhoCount++;
          }
        });

        const newChartData: UserTypeChartData[] = [];
        if (adminCount > 0) {
          newChartData.push({ name: "Administradores", value: adminCount });
        }
        if (vizinhoCount > 0) {
          newChartData.push({ name: "Vizinhos", value: vizinhoCount });
        }

        setChartData(newChartData);

      } catch (err) {
        console.error("GraphUsers: Erro ao buscar dados de utilizadores:", err);
        let errorMessage = "Ocorreu um erro ao carregar os dados do gráfico.";
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<any>;
            if (axiosError.response?.data?.error) {
                errorMessage = `Erro da API: ${axiosError.response.data.error}`;
            } else if (axiosError.request) {
                errorMessage = "Erro de rede. Verifique sua conexão ou o servidor.";
            }
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataForChart();
  }, [token]); 

  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Tipos de Utilizador</h3>
        <p className="text-gray-500">A carregar dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Tipos de Utilizador</h3>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Tipos de Utilizador</h3>
        <p className="text-gray-500 text-center">Não há dados para exibir no gráfico.</p>
      </div>
    );
  }

  // Renderização do gráfico
  return (
    <div className="flex flex-col h-full p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Tipos de Utilizador</h3>
      <div className="flex-grow"> {/* flex-grow permite que o gráfico preencha o espaço vertical */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData} 
              dataKey="value"    
              nameKey="name"     
              cx="50%"
              cy="50%"
              outerRadius="80%" 
              innerRadius="50%" 
              paddingAngle={2}  
              labelLine={false} 
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [`${value} utilizador${value !== 1 ? 'es' : ''}`, name]}
              wrapperStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid #e2e8f0', 
                borderRadius: '0.375rem', 
                padding: '0.5rem 0.75rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={12}
              wrapperStyle={{ paddingTop: "20px", paddingBottom: "10px" }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};