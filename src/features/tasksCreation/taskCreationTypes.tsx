export interface Endereco {
  rua: string;
  numeroPorta: number;
  codigoPostal: string;
  freguesia: string;
  distrito: string;
}

export interface Utilizador {
  idUtilizador: number;
  nomeUtilizador: string;
  pontosUtilizador: number;
  Endereco: Endereco;
}

export interface categoriaTarefa {
  idCategoriaTarefa: number;
  categoriaTarefa: string;
  pontosCategoria: number;
}

export interface criacaoTarefa {
  idTarefaCriada: number;
  nomeTarefa: string;
  dataInicio: string;
  dataFim: string;
  descricaoTarefa: string;
  Utilizador: Utilizador;
  categoriaTarefa: categoriaTarefa;
  estadoCriacaoTarefa: estadoCriacaoTarefa;
}

export interface estadoCriacaoTarefa {
  idEstadoCriacaoTarefa: number;
  estadoCriacaoTarefa: string;
}

export interface CreateTaskPayload {
  nomeTarefa: string;
  dataInicio: string;
  dataFim: string;
  descricaoTarefa: string;
  categoriaTarefaidCategoriaTarefa: number;
}
