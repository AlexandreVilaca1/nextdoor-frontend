import React from 'react';
import "../styles.css";

export const Header = () => {
    return (
        <div className=' h-20 w-full font-[Inter] flex justify-between px-24 items-center'>
            <div>
                <a href="/" className='flex items-center'>
                    <img src="/icon.png" alt="" className='w-[40px] h-[40px]' />
                    <h1 className='font-bold text-[#5A5A5A] text-xl'>NextDoor</h1>
                </a>
            </div>
            <div className='flex space-x-8'>
                <ul className='flex space-x-4 items-center text-[#5A5A5A]'>
                    <li>
                        <a href="" className='hover:text-black'><strong>Início</strong></a>
                    </li>
                    <li>
                        <a href="#sobre-nos" className='hover:text-black'>Sobre Nós</a>
                    </li>
                </ul>
                <div className='bg-[#4CAF4F] hover:bg-[#439A45] duration-150 ease-in-out text-white p-3 rounded-md cursor-pointer'>
                    <a href="/register" className='font-light'>Registre-se</a>
                </div>
            </div>
        </div>
    )
}