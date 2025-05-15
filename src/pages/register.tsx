import RegisterForm from '../components/RegisterForm';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Register = () => {
    return (
        <div className=''>
            <Header></Header>
            <section className='flex items-center justify-center py-30 h-full bg-[#F5F7FA]'>
                <RegisterForm></RegisterForm>
            </section>
            <Footer></Footer>
        </div>
    )
}