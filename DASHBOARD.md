# Dashboard do Painel (`/painel`)

## 1. Perfil do Usuário (header)

- Foto do Google (arredondada)
- Nome completo
- Email
- Botão "Sair" (logout via Better Auth, redireciona para `/`)

## 2. Estatísticas Pessoais

- **Respondidas**: total de questões respondidas pelo usuário
- **Inéditas**: questões aprovadas que o usuário ainda não respondeu
- **Taxa de acerto**: percentual de respostas corretas
- **Streak**: dias consecutivos respondendo ao menos 1 questão (reseta à meia-noite)

## 3. Progresso Geral

- Barra de progresso (respondidas / total aprovadas)
- Questões/dia necessárias até 1 de junho de 2026
- Dias restantes até a prova
- Botão "Batelada aleatória (10 questões)"

## 4. Leaderboards

Dois rankings com tabs **Dia / Semana / Mês / Sempre**:

### 4a. Mais questões resolvidas

- Ranking dos usuários que mais responderam questões no período
- Mostra: posição, foto, nome, total de questões

### 4b. Maior taxa de acerto

- Ranking dos usuários com maior percentual de acerto no período
- Mínimo de 10 questões no período para aparecer no ranking
- Mostra: posição, foto, nome, taxa de acerto, total de questões

### Regras

- Foto + nome completo de todos os usuários (dados do Google Auth)
- Destaque visual para o usuário logado na lista
- Máximo 10 posições por ranking

## 5. Navegação por Capítulo e Subtópico

- Já existente: lista de capítulos por parte com progresso
- Já existente: lista de subtópicos com progresso
- Subtópicos agora clicáveis (sessão filtrada)

## 6. Tela de Pagamento Confirmado

- Após pagamento via Stripe, exibir tela intermediária:
  - "Parabéns! Pagamento confirmado."
  - Breve mensagem de boas-vindas
  - Botão para ir ao painel
- Depois redireciona para `/painel`
