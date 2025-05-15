  import { criacaoTarefa } from "../tasksCreation/taskCreationTypes";
  import { Utilizador } from "../tasksCreation/taskCreationTypes";

  export interface realizacaoTarefa
  {
    idRealizacaoTarefa: number;
    dataRealizacao: string;
    criacaoTarefa: criacaoTarefa;
    Utilizador: Utilizador;
    estadoRealizacaoTarefa: estadoRealizacaoTarefa;
  }

  export interface estadoRealizacaoTarefa
  {
    idEstadoRealizacaoTarefa: number;
    estadoRealizacaoTarefa: string;
  }

