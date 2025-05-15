import "../styles.css";

export const Footer = () => {
    return (
      <footer className="bg-[#263238] text-white py-10 px-6 md:px-24 flex flex-col md:flex-row justify-between items-start gap-10">
        <div>
          <h1 className="font-bold text-xl text-white">NextDoor</h1>
          <p className="text-sm mt-2 text-gray-300">
            Conecta vizinhos para trocar favores e ajudar pontos. <br />
            Incentivando a colaboração e fortalecendo a comunidade.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Ajuda</h4>
          <p className="text-sm text-gray-300">Contacte-nos</p>
        </div>
      </footer>
    )
  }
  