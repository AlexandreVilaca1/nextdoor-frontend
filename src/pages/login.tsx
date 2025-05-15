import LoginForm from '../components/LoginForm';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Login = () => {
    return (
        <div className=''>
            <Header></Header>
            <section className='flex items-center justify-center py-30 h-full bg-[#F5F7FA]'>
                <LoginForm></LoginForm>
            </section>
            <Footer></Footer>
        </div>
    )
}