import { useState, useEffect } from "react";
import "../styles.css";
import { fetchNeighborhoods } from "../features/Neighborhood/neighborhoodService";
import { Neighborhood } from "../features/Neighborhood/neighborhoodTypes";

export default function RegisterForm() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodId, setNeighborhoodId] = useState<number | ''>('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bornDate, setBornDate] = useState('');
  const [proofNeighborhood, setProof] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [parish, setParish] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');

  useEffect(() => {
    async function loadNeighborhoods() {
      try {
        const data = await fetchNeighborhoods();
        setNeighborhoods(data);
      } catch (error) {
        console.error("Erro ao carregar vizinhanças:", error);
      }
    }

    loadNeighborhoods();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!neighborhoodId) {
      alert("Selecione uma vizinhança.");
      return;
    }

    try {
      const body = {
        nomeUtilizador: name,
        dataNascimento: bornDate,
        comprovativoResidencia: proofNeighborhood,
        emailUtilizador: email,
        password: password,
        VizinhançaidVizinhança: neighborhoodId,
        numeroPorta: doorNumber,
        distrito: district,
        freguesia: parish,
        codigoPostal: zipCode,
        rua: street
      };

      const response = await fetch("http://localhost:3000/api/users/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (response.ok) {
        alert("Utilizador registado com sucesso!");
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        console.error("Erro do servidor:", errorData);
        alert(errorData.error || "Erro ao registar utilizador.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na comunicação com o servidor.");
    }
  }

  return (
    <div className="w-[400px] rounded-lg flex items-center flex-col bg-white py-10">
      <h1 className="text-[24px]">Registar-se</h1>
      <form className="mt-15" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="mt-2">Nome</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Confirmação de Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Data de Nascimento</label>
          <input
            type="date"
            value={bornDate}
            onChange={e => setBornDate(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Vizinhança</label>
          <select
            value={neighborhoodId}
            onChange={(e) => setNeighborhoodId(Number(e.target.value))}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          >
            <option value="">Selecione uma vizinhança</option>
            {neighborhoods.map((n) => (
              <option key={n.idVizinhanca} value={n.idVizinhanca}>
                {n.nomeFreguesia}
              </option>
            ))}
          </select>

          <label className="mt-5">Comprovativo de Residência</label>
          <input
            type="text"
            value={proofNeighborhood}
            onChange={e => setProof(e.target.value)}
            placeholder="Comprovativo"
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Distrito</label>
          <input
            type="text"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Freguesia</label>
          <input
            type="text"
            value={parish}
            onChange={e => setParish(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Código Postal</label>
          <input
            type="text"
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Rua</label>
          <input
            type="text"
            value={street}
            onChange={e => setStreet(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <label className="mt-5">Número da Porta</label>
          <input
            type="text"
            value={doorNumber}
            onChange={e => setDoorNumber(e.target.value)}
            className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
          />

          <a href="/login" className="text-[12px] text-[#828282] mt-3">
            Já tens conta? Entre
          </a>
        </div>

        <button
          type="submit"
          className="bg-[#4CAF4F] cursor-pointer mt-10 w-[300px] h-[50px] rounded-lg text-white text-[16px] hover:bg-[#439A45] duration-150 ease-in-out"
        >
          Registar
        </button>
      </form>
    </div>
  );
}
