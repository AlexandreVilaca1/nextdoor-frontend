import { useState } from "react";
import "../styles.css";

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bornDate, setBornDate] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        try {
            const body = {
                nomeUtilizador: name,
                dataNascimento: bornDate,
                pontosUtilizador: 0,
                comprovativoResidencia: "comprovativo.pdf",
                emailUtilizador: email,
                password: password,
                estadoUtilizadoridEstadoUtilizador: 1,
                tipoUtilizadoridTipoUtilizador: 1,
            };
        
            console.log("Body da requisição:", body);
        
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
                alert("Erro ao registar utilizador.");
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
                        placeholder="Nome"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
                    />

                    <label className="mt-5">Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
                    />

                    <label className="mt-5">Senha</label>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"
                    />

                    <label className="mt-5">Confirmação de Senha</label>
                    <input
                        type="password"
                        placeholder="Confirme a senha"
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
