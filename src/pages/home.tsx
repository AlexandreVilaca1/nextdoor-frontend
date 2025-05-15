import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Home = () => {
    return (
        <div>
            <Header></Header>

        {/* HERO */}
      <section className="bg-[#F5F7FA] px-6 md:px-24 py-20 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4D4D4D]">
            Ajude a vizinhança e<br />
            ganhe <span className="text-[#4CAF4F]">recompensas</span>
          </h1>
          <p className="text-[#717171] mt-4">Crie ou realize tarefas, ajuste à sua necessidade</p>
          <a href="/login">
            <button className="mt-6 bg-[#4CAF4F] text-white px-6 py-3 rounded hover:bg-[#439A45] transition cursor-pointer">
              Entrar
            </button>
          </a>
        </div>
        <div className="flex-1">
          <img src="/hero.png" alt="Vizinhaça" className="w-full max-w-md mx-auto" />
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="text-center py-14 px-6">
        <h3 className="text-2xl text-[#37474F] font-bold mb-1">Nossos Parceiros</h3>
        <p className="text-[#717171] mb-6">Trabalhamos em parceria com 50+ estabelecimentos</p>
        <div className="flex justify-center flex-wrap gap-8 max-w-4xl mx-auto space-x-16 items-center">
          <img src="/prozis.png" alt="Parceiro 2" className="h-4 " />
          <img src="/meo.png" alt="Parceiro 1" className="h-20" />
          <img src="/continente.png" alt="Parceiro 3" className="h-8" />
          <img src="/nos.png" alt="Parceiro 4" className="h-8" />
          <img src="/lidl.png" alt="Parceiro 5" className="h-8" />
        </div>
      </section>

      {/* QUEM SOMOS / O QUE FAZEMOS */}
      <section id="sobre-nos" className="px-6 md:px-24 py-20 gap-16 items-start flex flex-col space-y-10">
        <div className='flex justify-around w-full'>
          <img src="/section2.png" alt="Sobre" className="w-full max-w-sm" />
          <div className='w-[435px]'>
            <h3 className="text-4xl font-bold text-[#4D4D4D] mt-6">Quem somos nós?</h3>
            <p className="text-[#717171] mt-3">
              Somos uma plataforma colaborativa criada para fortalecer o espírito de comunidade entre vizinhos. Acreditamos que pequenas ações fazem grandes diferenças, por isso desenvolvemos um sistema onde moradores podem oferecer e realizar tarefas do dia a dia — como ajudar com compras, cuidar de plantas ou pequenos consertos — acumulando pontos que podem ser trocados por descontos e produtos. Mais do que um aplicativo, somos uma rede de apoio local que transforma solidariedade em benefícios reais.
            </p>
          </div>
        </div>
        <div className='flex justify-around w-full'>
          <div className='w-[435px]'>
            <h3 className="text-4xl font-bold text-[#4D4D4D] mt-6">O que fazemos?</h3>
            <p className="text-[#717171] mt-3">
            Facilitamos a colaboração entre vizinhos por meio de um sistema simples e eficiente de troca de tarefas por pontos. No nosso aplicativo, os usuários podem solicitar ajuda, oferecer seus serviços e acumular pontos a cada tarefa concluída. Esses pontos podem ser trocados por descontos em estabelecimentos parceiros ou por produtos exclusivos, promovendo a solidariedade e valorizando o apoio mútuo dentro das comunidades.
            </p>
          </div>
          <img src="/section3.png" alt="Quem somos" className="w-full max-w-sm" />
        </div>
      </section>

            <Footer></Footer>
        </div>
    )
}