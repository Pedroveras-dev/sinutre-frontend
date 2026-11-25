## Sinutre — Projeto Final

**Frontend (Vercel):** https://sinutre-frontend-alpha.vercel.app

**Backend (Railway):** https://sinutre-backend-production-37ce0f19.up.railway.app

**Repositório do backend:** https://github.com/Pedroveras-dev/sinutre-backend

Fork de [danilob/sinutre-frontend](https://github.com/danilob/sinutre-frontend)
(projeto didático do professor). Frontend em **React 19 + TypeScript + Vite 6**,
com **Tailwind CSS v4** e **daisyUI v5**.

### Funcionalidades desenvolvidas

- [01] Alterar alimento — botão **Editar** em cada alimento da página Dieta (`PUT /foods/:id`).
- [02] Excluir alimento — botão **Apagar** com confirmação; se o alimento estiver em alguma refeição, o backend recusa e a tela diz em quantas.
- [03] Validação no cadastro de alimento — nome obrigatório (até 100 caracteres) e macros numéricos ≥ 0, no frontend e no backend.
- [04] Cadastrar meta diária, altura e peso — página **Configurações**, com validação (meta 500–10000 kcal; altura 50–250 cm; peso 20–400 kg).
- [05] Alterar meta, altura e peso — os mesmos formulários; cada alteração gera um registro novo e o histórico fica no banco.
- [06] Meta do banco no dashboard — o valor fixo `caloriesGoal: 1000` do original foi trocado pela meta do usuário; sem meta, o card diz isso em vez de mostrar um número inventado.
- [07] Sinalizar meta ultrapassada — card e calorias do dashboard ficam em vermelho com "Você ultrapassou a meta em X kcal".
- [08] Página de métricas no menu — item **Métricas** (`/stats`) com IMC e média de calorias.
- [09] IMC e faixa — IMC calculado da altura e do peso, com a faixa da OMS destacada (abaixo do peso, normal, sobrepeso, obesidade I, II e III).
- [10] Média dos últimos 7 dias e relação com a meta — "Sua média (X kcal) é Y% da sua meta", quanto ficou acima ou abaixo, dias dentro da meta e gráfico por dia.
- [11] Logout — botão **Sair** no menu; um token expirado (401) também volta ao login.
- [12] Mudar as cores da interface — em Configurações → Aparência: temas **Claro**, **Escuro** e **Oceano**, salvos no navegador.

### Além da tabela

- **Correção do cálculo de "hoje":** o original usava `getDay()` (dia da semana) e somava refeições de outras semanas no dia atual.
- **Correção de queda do servidor:** erros em rotas assíncronas derrubavam o backend; agora respondem 400/404/500 com mensagem.
- **Apagar refeições** no dashboard, recalculando os totais e o progresso da meta.
- **Editar alimento preserva o histórico:** refeições antigas mantêm os valores da época em que foram registradas.
- **Gráfico dos últimos 7 dias** com a linha da meta, feito só com HTML e CSS.
- **Testes automatizados:** 50 testes unitários no frontend (vitest) e 26 de integração no backend, incluindo isolamento entre usuários.
- **Banco PostgreSQL persistente** no lugar do SQLite em arquivo.
- Estados de carregamento, erro, envio e sucesso em todos os formulários; layout responsivo.

| Mudança | Onde |
|---|---|
| Configurações: meta, altura e peso, aparência | `src/pages/SettingsPage.tsx`, `src/components/settings/` |
| Card de progresso da meta no dashboard | `src/components/cards/CalorieGoalCard.tsx` |
| Regras da meta, de altura/peso, IMC e temas | `src/utils/calorieGoal.ts`, `src/utils/profile.ts`, `src/utils/theme.ts` |
| Chamadas à API | `src/services/` |
| Correção do cálculo "calorias de hoje" | `src/utils/date.ts`, `src/utils/mealSummary.ts` |
| Testes unitários (vitest) | `src/utils/*.test.ts` |
| Volta ao login em `401` e botão **Sair** | `src/lib/api.ts`, `src/components/layout/Sidebar.tsx` |
| Editar e apagar alimentos | `src/pages/DietFood.tsx`, `src/components/modal/FoodFormModal.tsx`, `src/utils/food.ts` |
| Apagar refeições | `src/pages/DashboardPage.tsx`, `src/components/modal/ConfirmDialog.tsx` |
| Página **Métricas** (`/stats`) | `src/pages/ProgressPage.tsx`, `src/components/cards/BmiCard.tsx`, `src/components/charts/CaloriesBarChart.tsx`, `src/utils/progress.ts` |

### Meta diária de calorias

- Em **Configurações**, o usuário consulta e edita a própria meta. O campo
  aceita apenas um **inteiro entre 500 e 10000 kcal** (limites de sanidade,
  não recomendação nutricional). A mesma regra é validada de novo no backend.
- Quem ainda não tem meta vê o campo **vazio** e a mensagem "Você ainda não
  definiu uma meta diária" — nenhum valor é sugerido.
- O formulário trata os estados de **carregamento**, **erro ao carregar**
  (com "Tentar novamente"), **envio em andamento**, **sucesso** e **erro ao
  salvar**.
- No **dashboard**, o valor fixo `caloriesGoal: 1000` do projeto original foi
  substituído pela meta real. O card mostra consumido / meta, barra de
  progresso e a mensagem "Faltam X kcal" ou "Você ultrapassou a meta em X kcal".
- O frontend nunca envia `userId`: o backend identifica o usuário pelo token.

### Correção do cálculo diário

O original comparava `getDay()` (dia da **semana**, 0–6), então somava em
"hoje" as refeições de toda quarta-feira do mês, por exemplo. Agora a
comparação usa dia, mês e ano no fuso do navegador (`isSameLocalDay`). O
modal de refeição também passou a enviar a data em ISO/UTC, para o horário
gravado não depender do fuso do servidor.

### Editar e apagar alimentos e refeições

O original só permitia cadastrar. Agora:

- Na página **Dieta**, cada alimento tem os botões **Editar** e **Apagar**.
  O mesmo modal serve para cadastrar e editar, com validação (nome
  obrigatório, macros numéricos ≥ 0, aceita vírgula decimal).
- Apagar pede confirmação. Se o alimento for usado em alguma refeição, o
  backend recusa e a tela mostra em quantas refeições ele aparece.
- No **dashboard**, cada refeição tem o botão **Apagar**; ao confirmar, os
  totais do dia e o progresso da meta são recalculados.
- Editar um alimento **não altera refeições já registradas**: elas guardam os
  valores da época em que foram criadas.

### Altura, peso e IMC

- Em **Configurações**, o cartão **Altura e peso** aceita altura em cm e peso
  em kg (com vírgula ou ponto). Os dados vão para `PUT /profile`; quem ainda
  não cadastrou vê os campos vazios.
- Na página **Métricas**, o IMC é `peso / altura²`, com 1 casa decimal. A
  faixa é decidida pelo valor arredondado, para o número e a faixa nunca se
  contradizerem. Sem altura e peso, o cartão leva para Configurações.

### Temas de cor

Configurações → **Aparência** troca as cores na hora. Os três temas estão em
`src/styles/theme.css`; a escolha fica no `localStorage` (`sinutre.theme`) e um
script no `index.html` aplica o tema antes da primeira pintura, para a tela
não piscar.

### Página Métricas

O item "Progresso" do menu apontava para uma rota que não existia. Agora se
chama **Métricas** e mostra o IMC e as calorias dos **últimos 7 dias**
comparadas com a meta:

- a média do período como porcentagem da meta e quanto ficou acima ou abaixo;

- gráfico de barras por dia, com a linha da meta; dias acima da meta ficam em
  vermelho e marcados com ▲, e dias sem registro ficam em cinza;
- média diária (só dos dias com refeição), dias dentro da meta e total de
  refeições no período;
- detalhe do dia ao passar o mouse, focar ou tocar numa barra, e os mesmos
  números em tabela.

O gráfico é feito com HTML e CSS, sem biblioteca. Os dados vêm das rotas que
`GET /meals`, `GET /calorie-goal` e `GET /profile`; o agrupamento por dia é
feito no navegador, no fuso do usuário.

## Instalação e execução local

Requisitos: Node.js 20+ e o [backend](https://github.com/Pedroveras-dev/sinutre-backend) rodando.

```bash
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3333
npm run dev             # http://localhost:5173
```

### Variáveis de ambiente

| Variável | Para que serve | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL do backend, sem `/` final | `http://localhost:3333` |

Variáveis `VITE_*` são embutidas no JavaScript público no momento do build:
**nunca** coloque segredos nelas.

## Como testar

```bash
npm run lint    # ESLint
npm test        # vitest: meta, alimentos, altura/peso, IMC, progresso e cálculo diário
npm run build   # tsc -b + vite build
```

Roteiro manual:

1. Entre com o GitHub. No dashboard, o card indica que não há meta definida.
2. Abra **Configurações**, tente `abc`, `1800,5` e `200` (rejeitados) e salve `2000`.
3. Recarregue a página: a meta continua lá.
4. Em **Dieta**, cadastre um alimento; no dashboard, adicione uma refeição de
   hoje e veja o progresso. Adicione mais até passar da meta.
5. Cadastre uma refeição com data de outro dia: ela não entra em "hoje".
6. Em **Dieta**, edite um alimento: as refeições antigas mantêm os totais.
7. Tente apagar um alimento usado em refeição (recusado, com aviso); apague
   a refeição no dashboard e depois o alimento.
8. Em **Configurações**, tente altura `1,75` (rejeitada: é em cm) e salve
   `175` e `72,5`. Em **Métricas**, veja o IMC 23,7 na faixa "Peso normal".
9. Em **Configurações → Aparência**, escolha **Escuro**; recarregue: o tema continua.
10. Clique em **Sair** e entre com outra conta: meta, altura e peso dela são independentes.

## Deploy

O frontend é um site estático (pasta `dist`) publicado na **Vercel**:

1. Em <https://vercel.com/new>, importe este repositório. A Vercel detecta o
   Vite sozinha (build `npm run build`, saída `dist`).
2. Em **Environment Variables**, crie `VITE_API_URL` com a URL pública do
   backend no Railway (sem `/` final) e faça o deploy.
3. O `vercel.json` reescreve qualquer caminho para `/index.html`, o que
   permite abrir ou recarregar `/settings`, `/foods` e `/stats` diretamente.

Observações:

- `VITE_API_URL` é lida no **build**: mudar o valor exige um novo deploy
  (*Deployments → ⋯ → Redeploy*).
- No backend, `FRONTEND_URL` deve ser exatamente a URL deste site (CORS e
  redirect do login). Use a URL de produção fixa, não as URLs de preview.
- O `render.yaml` continua no repositório como alternativa (Render Static Site).

## Estrutura

```
src/
├── components/   # cards, charts, forms, layout, macros, meals, modal, settings
├── constants/    # categorias de refeição, itens de navegação
├── context/      # AuthContext (usuário autenticado)
├── lib/          # cliente HTTP (axios + token)
├── pages/        # Dashboard, DietFood, Progress (Métricas), Settings, Login
├── routes/       # rotas e rota protegida
├── services/     # chamadas à API
├── styles/       # Tailwind e temas Claro, Escuro e Oceano
├── types/        # tipos de domínio
└── utils/        # datas, resumo diário, progresso, meta, perfil/IMC, temas (+ testes)
```
