import { useState } from "react";
import "../styles.css";
import Cookies from 'js-cookie';

export default function LoginForm () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e: any) {
        e.preventDefault();

        console.log(email, password)

        const response = await fetch("http://localhost:3000/api/users/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "emailUtilizador": email, "password": password }),
            credentials: 'include'
        })

        if (response.ok) {
            const data = await response.json();
            const token = data.token;
      
            Cookies.set('jwt', token, { expires: 1 / 24 });
            window.location.href = "/tasksCreated"
      
            alert('Login bem-sucedido!');
          } else {
            alert('Falha no login');
          }
        }
        

    return (
        <div className=" w-[400px] h-[500px] rounded-lg flex items-center flex-col bg-white">
            <h1 className="mt-10 text-[24px]">Entrar</h1>
            <form className="mt-15" onSubmit={handleSubmit}>
                <div className="flex flex-col ">
                    <label htmlFor="">Email</label>
                    <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"/>
                    <label htmlFor="" className="mt-5">Senha</label>
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-[300px] h-[50px] border rounded-lg border-[#C1C1C1] p-2"/>
                    <a href="/register" className="text-[12px] text-[#828282]">És novo? Registe-se</a>
                </div>
                <button type="submit" className="bg-[#4CAF4F] cursor-pointer mt-10 w-[300px] h-[50px] rounded-lg text-white text-[16px] hover:bg-[#439A45] duration-150 ease-in-out">Entrar</button>
            </form> 
        </div>
    )
}