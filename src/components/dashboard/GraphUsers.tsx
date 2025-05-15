import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import Cookies from 'js-cookie';

type TipoUtilizador = {
  tipoutilizador: string;
  total: number;
};

const COLORS = ["#10B981", "#3B82F6"]; 

export const GraphUsers = () => {
  const [data, setData] = useState<TipoUtilizador[]>([]); 
  
  const token = Cookies.get('jwt');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.warn("Token não encontrado!");
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/api/users/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const users = res.data.user;
        if (!users) {
          console.warn("Dados de utilizadores não encontrados!");
          return;
        }

        const groupedData = [
          {
            tipoutilizador: "Administrador",
            total: users.filter((user: any) => user.tipoUtilizador.idTipoUtilizador === 1).length,
          },
          {
            tipoutilizador: "Vizinho",
            total: users.filter((user: any) => user.tipoUtilizador.idTipoUtilizador === 2).length,
          },
        ];

        setData(groupedData);
      } catch (err) {
        console.error("Erro ao buscar dados de utilizadores:", err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-700">Gestão de Utilizadores</h3>

      <div className="flex-1 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="tipoutilizador"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} `, name]} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={14}
              layout="horizontal"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
