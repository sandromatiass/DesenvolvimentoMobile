# Cardápio Digital — Delivery Tools

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento Mobile**.
Trata-se de um sistema de autenticação completo para uma aplicação de cardápio digital,
composto por um **backend REST em NestJS** e um **aplicativo mobile em React Native**.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Rodando o Projeto](#rodando-o-projeto)
- [Rotas da API](#rotas-da-api)
- [Fluxo de Uso](#fluxo-de-uso)

---

## Visão Geral

O **Cardápio Digital** é uma aplicação mobile que permite que usuários criem conta,
façam login e gerenciem sua autenticação. O sistema inclui um fluxo completo de
**recuperação de senha via e-mail**, onde um código de 6 dígitos é enviado ao usuário
e tem validade de 10 minutos.

```
Usuário abre o app
       │
       ├─► Não tem conta? ──► Cadastro ──► Login automático
       │
       └─► Tem conta? ──► Login ──► Tela Principal
                             │
                             └─► Esqueceu a senha? ──► E-mail com código ──► Nova senha
```

---

## Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Papel |
|---|---|---|
| [NestJS](https://nestjs.com/) | ^10 | Framework Node.js para APIs REST |
| [TypeORM](https://typeorm.io/) | ^0.3 | ORM para acesso ao banco de dados |
| [PostgreSQL](https://www.postgresql.org/) | — | Banco de dados relacional |
| [Passport + JWT](https://docs.nestjs.com/security/authentication) | — | Autenticação via tokens |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | ^5 | Hash seguro de senhas |
| [Nodemailer](https://nodemailer.com/) | ^6 | Envio de e-mails |
| [class-validator](https://github.com/typestack/class-validator) | ^0.14 | Validação dos dados recebidos |

### Mobile

| Tecnologia | Versão | Papel |
|---|---|---|
| [React Native](https://reactnative.dev/) | 0.74.5 | Framework mobile (Android/iOS) |
| [React Navigation](https://reactnavigation.org/) | ^6 | Navegação entre telas |
| [Axios](https://axios-http.com/) | ^1.7 | Requisições HTTP à API |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | ^1.23 | Persistência local de sessão |
| [Formik](https://formik.org/) | ^2.4 | Gerenciamento de formulários |
| [Yup](https://github.com/jquense/yup) | ^1.4 | Validação dos formulários |
| TypeScript | 5.0 | Tipagem estática |

---

## Estrutura do Projeto

```
DesenvolvimentoMobile/
├── backend/                      # API REST (NestJS)
│   ├── src/
│   │   ├── app.module.ts         # Módulo raiz — configura banco e importa módulos
│   │   ├── main.ts               # Ponto de entrada — sobe o servidor na porta 3000
│   │   ├── auth/                 # Módulo de autenticação
│   │   │   ├── auth.controller.ts    # Define as rotas HTTP (POST /auth/*)
│   │   │   ├── auth.service.ts       # Lógica de negócio (register, login, reset...)
│   │   │   ├── auth.module.ts        # Registra dependências do módulo
│   │   │   ├── decorators/
│   │   │   │   └── current-user.decorator.ts  # Extrai usuário do token JWT
│   │   │   ├── dto/                  # Objetos de transferência de dados (validação)
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   ├── verify-code.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts  # Protege rotas que exigem login
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts    # Decodifica e valida o token JWT
│   │   ├── users/
│   │   │   └── entities/
│   │   │       └── user.entity.ts     # Tabela `users` no banco de dados
│   │   ├── password-resets/
│   │   │   └── entities/
│   │   │       └── password-reset.entity.ts  # Tabela `password_resets`
│   │   └── mail/
│   │       ├── mail.module.ts
│   │       └── mail.service.ts        # Envia e-mail com código de verificação
│   ├── .env                       # Variáveis de ambiente (não versionado)
│   └── package.json
│
└── mobile/                       # Aplicativo React Native
    ├── src/
    │   ├── auth/
    │   │   ├── navigation/
    │   │   │   └── AuthNavigator.tsx   # Navegação das telas de autenticação
    │   │   └── screens/
    │   │       ├── WelcomeScreen.tsx   # Tela inicial (Entrar / Cadastrar)
    │   │       ├── LoginScreen.tsx     # Formulário de login
    │   │       ├── RegisterScreen.tsx  # Formulário de cadastro
    │   │       ├── ForgotPasswordScreen.tsx  # Solicita e-mail para recuperação
    │   │       ├── VerifyCodeScreen.tsx      # Digita o código recebido por e-mail
    │   │       └── ResetPasswordScreen.tsx   # Define nova senha
    │   ├── home/
    │   │   └── screens/
    │   │       └── HomeScreen.tsx      # Tela principal (pós-login)
    │   ├── navigation/
    │   │   ├── RootNavigator.tsx       # Decide entre AuthNavigator e AppNavigator
    │   │   └── AppNavigator.tsx        # Navegação para usuários autenticados
    │   ├── contexts/
    │   │   └── AuthContext.tsx         # Estado global de autenticação
    │   ├── hooks/
    │   │   └── useAuth.ts              # Hook para acessar o AuthContext
    │   ├── services/
    │   │   ├── api.ts                  # Instância do Axios com interceptors JWT
    │   │   └── auth.service.ts         # Funções que chamam a API
    │   └── types/
    │       ├── navigation.ts           # Tipagem das rotas de navegação
    │       └── env.d.ts                # Tipagem das variáveis de ambiente
    ├── .env                        # URL da API (não versionado)
    └── package.json
```

---

## Funcionalidades

### Autenticação

- **Cadastro de usuário** — nome, e-mail e senha (com confirmação). A senha é armazenada com hash bcrypt (10 rounds). Ao cadastrar, o usuário já recebe o token de acesso.
- **Login** — e-mail e senha. Retorna JWT de acesso.
- **Persistência de sessão** — o token e os dados do usuário são armazenados no AsyncStorage. Ao reabrir o app, a sessão é restaurada automaticamente.
- **Logout** — remove o token e os dados locais.
- **Perfil** — rota protegida que retorna os dados do usuário logado.

### Recuperação de Senha (3 etapas)

1. **Esqueci minha senha** — usuário informa o e-mail. Se cadastrado, recebe um código numérico de 6 dígitos por e-mail (válido por 10 minutos).
2. **Verificação do código** — usuário digita o código recebido. O backend retorna um `resetToken` temporário (JWT separado do token de acesso).
3. **Nova senha** — usuário define e confirma a nova senha. O `resetToken` é validado e a senha é atualizada com novo hash.

### Segurança

- Senhas nunca são retornadas pela API (campo `select: false` na entidade)
- Tokens JWT com expiração configurável
- `resetToken` é um JWT separado, com secret diferente, só para o fluxo de reset
- Código de reset é invalidado após uso (`used: true`)
- Validação de todos os campos de entrada com `class-validator` no backend e `Yup` no mobile
- Interceptor no Axios faz logout automático quando a API retorna 401

---

## Arquitetura

### Backend — Fluxo de uma requisição

```
Requisição HTTP
      │
      ▼
 Controller        ← valida o DTO (class-validator)
      │
      ▼
  Service          ← lógica de negócio (bcrypt, jwt, queries)
      │
      ├──► Repository (TypeORM) ──► PostgreSQL
      │
      └──► MailService ──► Nodemailer ──► SMTP
```

### Mobile — Fluxo de autenticação

```
App inicia
    │
    ▼
RootNavigator
    │
    ├─ isLoading=true ──► Spinner
    │
    ├─ isAuthenticated=true ──► AppNavigator (HomeScreen)
    │
    └─ isAuthenticated=false ──► AuthNavigator (Welcome/Login/Cadastro/...)
```

O `AuthContext` mantém o estado global (`user`, `token`, `isAuthenticated`) e expõe
as funções `login`, `logout` e `register`. O `useAuth` hook acessa esse contexto em
qualquer tela.

### Banco de Dados

O TypeORM está configurado com `synchronize: true`, o que significa que ele cria e
atualiza as tabelas automaticamente com base nas entidades.

**Tabela `users`**

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID | Chave primária gerada automaticamente |
| name | varchar | Nome do usuário |
| email | varchar (unique) | E-mail — usado para login |
| password | varchar | Hash bcrypt da senha |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Data da última atualização |

**Tabela `password_resets`**

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID | Chave primária |
| userId | UUID (FK) | Referência ao usuário |
| code | varchar(6) | Código numérico de 6 dígitos |
| expiresAt | timestamp | Momento de expiração (10 min) |
| used | boolean | Se o código já foi utilizado |
| createdAt | timestamp | Data de criação |

---

## Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior
- [PostgreSQL](https://www.postgresql.org/) rodando localmente
- [React Native CLI](https://reactnative.dev/docs/environment-setup) configurado
- [Android Studio](https://developer.android.com/studio) com um emulador configurado (ou dispositivo físico com USB debugging)
- Java JDK 17+

---

## Configuração do Ambiente

### 1. Backend — `backend/.env`

Crie o arquivo `backend/.env` com base no exemplo abaixo:

```env
# Servidor
APP_PORT=3000

# Banco de dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=sua_senha_aqui
DB_NAME=menu_deliverytools

# JWT — token de acesso
JWT_SECRET=seu_segredo_jwt_aqui
JWT_EXPIRES_IN=7d

# JWT — token de reset de senha (secret diferente!)
JWT_RESET_SECRET=seu_segredo_reset_aqui
JWT_RESET_EXPIRES_IN=15m

# E-mail (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_de_app_gmail
MAIL_FROM="Delivery Tools <seu_email@gmail.com>"
```

> **Dica Gmail:** Para `MAIL_PASS`, não use sua senha normal. Acesse
> Conta Google → Segurança → Senhas de app e gere uma senha específica.

### 2. Criar o banco de dados

No PostgreSQL, execute:

```sql
CREATE DATABASE menu_deliverytools;
```

As tabelas são criadas automaticamente pelo TypeORM ao iniciar o servidor.

### 3. Mobile — `mobile/.env`

Crie o arquivo `mobile/.env`:

```env
API_BASE_URL=http://10.0.2.2:3000
```

> `10.0.2.2` é o endereço que o emulador Android usa para acessar o `localhost`
> da máquina host. Para dispositivo físico, use o IP da sua máquina na rede local
> (ex: `http://192.168.1.100:3000`).

---

## Rodando o Projeto

### Backend

```bash
# Instalar dependências
cd backend
npm install

# Iniciar em modo desenvolvimento (reinicia ao salvar)
npm run start:dev

# O servidor estará disponível em:
# http://localhost:3000
```

### Mobile

Abra **dois terminais** na pasta `mobile`:

**Terminal 1 — Metro Bundler:**
```bash
cd mobile
npm install
npm start
```

**Terminal 2 — Emulador Android:**
```bash
cd mobile
npm run android
```

Ou, no terminal do Metro, pressione `a` para Android ou `i` para iOS.

---

## Rotas da API

Base URL: `http://localhost:3000`

| Método | Rota | Corpo | Autenticação | Descrição |
|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password, confirmPassword }` | Não | Cria nova conta |
| POST | `/auth/login` | `{ email, password }` | Não | Retorna JWT de acesso |
| POST | `/auth/forgot-password` | `{ email }` | Não | Envia código por e-mail |
| POST | `/auth/verify-code` | `{ email, code }` | Não | Valida código, retorna resetToken |
| POST | `/auth/reset-password` | `{ resetToken, password, confirmPassword }` | Não | Atualiza a senha |
| GET | `/auth/profile` | — | Bearer Token | Retorna dados do usuário logado |

### Exemplos de resposta

**POST /auth/login — sucesso (200)**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**POST /auth/forgot-password — sucesso (200)**
```json
{
  "message": "Código enviado para o e-mail"
}
```

**POST /auth/verify-code — sucesso (200)**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Fluxo de Uso

### Cadastro

1. Abre o app → tela de boas-vindas
2. Toca em **Cadastrar**
3. Preenche nome, e-mail, senha e confirmação
4. O app chama `POST /auth/register`
5. Token retornado é salvo no AsyncStorage
6. Usuário é redirecionado para a tela principal

### Login

1. Toca em **Entrar**
2. Preenche e-mail e senha
3. O app chama `POST /auth/login`
4. Token salvo localmente — sessão restaurada automaticamente ao reabrir o app

### Recuperação de Senha

1. Na tela de login, toca em **Esqueci minha senha**
2. Informa o e-mail cadastrado → `POST /auth/forgot-password`
3. Recebe e-mail com código de 6 dígitos (válido 10 min)
4. Digita o código → `POST /auth/verify-code` → recebe `resetToken`
5. Define nova senha → `POST /auth/reset-password`
6. Redirecionado para o login com a nova senha
