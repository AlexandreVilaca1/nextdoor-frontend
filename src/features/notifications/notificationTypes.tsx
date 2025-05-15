import { realizacaoTarefa } from "../taskRealization/taskRealizationTypes";

export interface Notificacao {
  idNotificacao: number;
  mensagem: string;
  dataEnvio: string;
  realizacaoTarefa: realizacaoTarefa
}