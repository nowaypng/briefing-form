import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'companyName',
    label: 'Qual o nome da sua empresa?',
    placeholder: 'Ex: Apple Inc.',
    type: 'text',
    helperText: 'O nome oficial ou como sua marca é conhecida.'
  },
  {
    id: 'businessDescription',
    label: 'O que sua empresa faz?',
    placeholder: 'Descreva brevemente seu negócio...',
    type: 'textarea',
    helperText: 'Explique o propósito e a essência do que você entrega.'
  },
  {
    id: 'mainProductService',
    label: 'Qual é o principal serviço ou produto que você vende hoje?',
    placeholder: 'Ex: Consultoria de Marketing Digital',
    type: 'text',
    helperText: 'Aquele que traz mais faturamento ou é o seu carro-chefe.'
  },
  {
    id: 'idealCustomer',
    label: 'Quem é seu cliente ideal?',
    placeholder: 'Descreva o perfil de quem compra de você...',
    type: 'textarea',
    helperText: 'Idade, profissão, interesses ou tipo de empresa (B2B).'
  },
  {
    id: 'websiteGoal',
    label: 'Qual é o principal objetivo do novo site?',
    placeholder: 'Ex: Gerar mais leads, vender produtos, autoridade...',
    type: 'textarea',
    helperText: 'O que define o sucesso deste projeto?'
  },
  {
    id: 'businessPains',
    label: 'Quais são hoje as maiores dores do seu negócio?',
    placeholder: 'O que tira seu sono em relação às vendas ou processos?',
    type: 'textarea'
  },
  {
    id: 'timeConsumingTasks',
    label: 'O que mais toma tempo no dia a dia?',
    placeholder: 'Atividades que consomem sua energia...',
    type: 'textarea'
  },
  {
    id: 'repetitiveTasks',
    label: 'Quais tarefas são repetitivas, manuais ou geram retrabalho?',
    placeholder: 'Ex: Enviar orçamentos, responder as mesmas dúvidas...',
    type: 'textarea'
  },
  {
    id: 'automationWishes',
    label: 'O que você mais gostaria de automatizar hoje?',
    placeholder: 'Se pudesse apertar um botão e algo acontecesse sozinho...',
    type: 'textarea'
  },
  {
    id: 'visitorAction',
    label: 'O que você quer que o visitante faça ao entrar no site?',
    placeholder: 'Ex: Clicar no botão do WhatsApp, preencher formulário...',
    type: 'textarea',
    helperText: 'A chamada para ação (CTA) principal.'
  }
];
