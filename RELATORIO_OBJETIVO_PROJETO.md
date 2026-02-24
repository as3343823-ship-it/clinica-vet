# Relatório — Objetivo do Projeto Clínica Vet Pata-Node

## 1. Objetivo principal
O projeto **Clínica Vet Pata-Node** tem como objetivo digitalizar e organizar as operações essenciais de uma clínica veterinária, oferecendo uma aplicação web com autenticação e áreas separadas para:
- **Funcionários da clínica** (operações internas),
- **Tutores/Clientes** (acesso ao próprio espaço de acompanhamento).

Em termos práticos, o sistema busca reduzir processos manuais (papel, planilhas soltas e comunicação fragmentada) e centralizar os dados clínicos e administrativos em um único fluxo.

---

## 2. Problema que o projeto resolve
Antes de um sistema como este, clínicas normalmente enfrentam:
- Dificuldade para controlar cadastro de tutores e animais,
- Risco de perda ou inconsistência de informações,
- Agenda desorganizada de tratamentos/atendimentos,
- Baixa visibilidade de indicadores e relatórios,
- Experiência fraca para o cliente acompanhar seu espaço.

O projeto resolve isso ao estruturar o processo em módulos com login, permissões e telas específicas por perfil de utilizador.

---

## 3. Escopo funcional (visão geral)
Com base na estrutura atual do projeto, o escopo inclui:
- **Autenticação** de funcionário e tutor,
- **Cadastro e gestão de tutores**, 
- **Área do cliente** com sessão autenticada,
- **Gestão de animais**,
- **Agenda de tratamentos/atendimentos**,
- **Relatórios** para apoio à operação.

Também existe suporte a upload de imagens (ex.: imagens de animais), reforçando o uso prático no dia a dia clínico.

---

## 4. Público-alvo
- **Interno:** receção, assistentes, veterinários e gestão da clínica.
- **Externo:** tutores/clientes que utilizam o sistema para acesso ao próprio espaço.

---

## 5. Resultado esperado
Ao final da implantação e estabilização, espera-se:
- Melhor organização operacional,
- Mais rapidez no atendimento,
- Menos erros de registo e retrabalho,
- Melhor experiência do cliente no acesso ao sistema,
- Melhor apoio à decisão por meio de relatórios.

---

## 6. Objetivo de evolução
Como evolução natural, o projeto pode ampliar:
- Notificações automáticas (lembretes de consultas/banho/vacinas),
- Histórico clínico mais detalhado,
- Indicadores avançados de desempenho,
- Melhorias contínuas de segurança e experiência do utilizador.

---

## 7. Conclusão
O **Clínica Vet Pata-Node** é um sistema orientado à gestão integrada de clínica veterinária, focado em eficiência operacional e melhor atendimento ao cliente. Seu objetivo central é transformar tarefas dispersas em um fluxo digital, seguro e organizado, com papéis bem definidos para funcionários e tutores.


---

## 8. Funcionalidades por perfil

### 8.1 Funções Gerais (todos os usuários)
- Login / Logout com JWT.
- Cadastro de conta (tutor).
- Upload de foto do animal.
- Acesso controlado por perfil (verificação JWT).

### 8.2 Funções do ADMIN / FUNCIONÁRIO
- Login como admin ou funcionário.
- Cadastrar tutor.
- Cadastrar animal (com foto, espécie, sexo, peso, sintomas e gravidade).
- Classificação automática Manchester (A, B, C, D).
- Agendar tratamento e exame.
- Ver agenda completa.
- Dar alta a animal.
- Ver relatórios (total de animais e distribuição por classificação).
- Ver sistema Manchester (lista ordenada por prioridade).

### 8.3 Funções do CLIENTE / TUTOR
- Cadastro de conta.
- Login com email e senha.
- Ver lista dos seus animais (com fotos).
- Cadastrar novo animal para si mesmo.
- Ver agenda dos seus animais.
- Ver status dos atendimentos.
