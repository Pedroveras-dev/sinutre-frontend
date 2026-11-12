# sinutre-frontend

Frontend do **SiNutre — Sistema de Ingestão de Macronutrientes**: dashboard de
nutrição em **React 19 + TypeScript + Vite 6**, com **Tailwind CSS v4** e
**daisyUI v5**.

> Fork de [danilob/sinutre-frontend](https://github.com/danilob/sinutre-frontend)
> (projeto didático do professor), com a funcionalidade **meta diária de
> calorias por usuário** e a preparação para deploy.
>
> - Backend deste sistema: <https://github.com/Pedroveras-dev/sinutre-backend>
> - Site publicado: <https://sinutre-frontend-alpha.vercel.app>
> - API publicada: <https://sinutre-backend.onrender.com> (verificação: [`/health`](https://sinutre-backend.onrender.com/health))

## O que este fork acrescenta

| Mudança | Onde |
|---|---|
| Página **Configurações** (`/settings`) com o formulário da meta | `src/pages/SettingsPage.tsx` |
| Card de progresso da meta no dashboard | `src/components/cards/CalorieGoalCard.tsx` |
| Regras e validação da meta | `src/utils/calorieGoal.ts` |
| Chamadas `GET/PUT /calorie-goal` | `src/services/calorieGoalService.ts` |
| Correção do cálculo "calorias de hoje" | `src/utils/date.ts`, `src/utils/mealSummary.ts` |
| Testes unitários (vitest) | `src/utils/*.test.ts` |
| Volta ao login em `401` e botão **Sair** | `src/lib/api.ts`, `src/components/layout/Sidebar.tsx` |
| Editar e apagar alimentos | `src/pages/DietFood.tsx`, `src/components/modal/FoodFormModal.tsx`, `src/utils/food.ts` |
| Apagar refeições | `src/pages/DashboardPage.tsx`, `src/components/modal/ConfirmDialog.tsx` |

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
npm test        # vitest: validação da meta e de alimentos, progresso e cálculo diário
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
8. Clique em **Sair** e entre com outra conta: a meta dela é independente.

## Deploy

O frontend é um site estático (pasta `dist`). O repositório traz a
configuração de duas opções gratuitas, ambas com HTTPS; use uma delas.

### Opção A — Vercel

1. Em <https://vercel.com/new>, importe este repositório. A Vercel detecta o
   Vite sozinha (build `npm run build`, saída `dist`).
2. Em **Environment Variables**, crie `VITE_API_URL` com a URL pública do
   backend (`https://SEU-BACKEND.onrender.com`, sem `/` final) e faça o deploy.
3. O `vercel.json` reescreve qualquer caminho para `/index.html`, o que
   permite abrir ou recarregar `/settings` e `/foods` diretamente.

### Opção B — Render Static Site

*New → Blueprint* e escolha este repositório. O `render.yaml` define o build
`npm ci && npm run build`, a pasta `dist` e a mesma regra de rewrite. Informe
`VITE_API_URL` quando o Render pedir.

### Nas duas opções

- `VITE_API_URL` é lida no **build**: mudar o valor exige um novo deploy.
- No backend, `FRONTEND_URL` deve ser exatamente a URL deste site (CORS e
  redirect do login). Use a URL de produção fixa, não as URLs de preview.
- O backend gratuito hiberna após 15 min sem uso; o primeiro acesso depois
  disso pode levar cerca de 1 minuto.

## Estrutura

```
src/
├── components/   # cards, forms, layout, macros, meals, modal
├── constants/    # categorias de refeição, itens de navegação
├── context/      # AuthContext (usuário autenticado)
├── lib/          # cliente HTTP (axios + token)
├── pages/        # Dashboard, DietFood, Settings, Login
├── routes/       # rotas e rota protegida
├── services/     # chamadas à API
├── types/        # tipos de domínio
└── utils/        # datas, resumo diário, regras da meta (+ testes)
```
