# 🚀 Guia de Deploy - Galeria Secreta

## Pré-requisitos

1. **Conta no GitHub** - Para hospedar o código
2. **Conta no Supabase** - Para banco de dados
3. **Conta no Render** - Para hospedagem

## Passo 1: Configurar Supabase

### 1.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha:
   - **Name**: galeria-secreta
   - **Database Password**: (anote esta senha)
   - **Region**: escolha a mais próxima

### 1.2 Configurar Database
1. Aguarde o projeto ser criado (2-3 minutos)
2. Vá para **SQL Editor**
3. Clique em "New Query"
4. Copie e cole todo o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
5. Clique em "Run" para executar

### 1.3 Configurar Storage
1. Vá para **Storage**
2. Clique em "Create a new bucket"
3. Nome: `photos`
4. Marque como **Public bucket**
5. Clique em "Create bucket"

### 1.4 Obter Credenciais
1. Vá para **Settings** → **API**
2. Anote:
   - **Project URL** (ex: https://abc123.supabase.co)
   - **anon public** key (chave longa)

## Passo 2: Preparar Código no GitHub

### 2.1 Criar Repositório
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `galeria-secreta`
4. Marque como **Public**
5. Clique em "Create repository"

### 2.2 Fazer Upload do Código
```bash
# No terminal, na pasta do projeto:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/galeria-secreta.git
git push -u origin main
```

## Passo 3: Deploy no Render

### 3.1 Criar Web Service
1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte sua conta GitHub
4. Selecione o repositório `galeria-secreta`
5. Clique em "Connect"

### 3.2 Configurar Service
Preencha os campos:

- **Name**: `galeria-secreta`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Plan**: `Free` (ou pago se preferir)

### 3.3 Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `VITE_SUPABASE_URL` | Sua URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |

### 3.4 Fazer Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos)
3. Sua aplicação estará disponível na URL fornecida

## Passo 4: Testar a Aplicação

### 4.1 Verificar Funcionalidades
1. **Homepage** - Deve carregar normalmente
2. **Galeria** - Modelos devem aparecer
3. **Candidatura** - Formulário deve funcionar
4. **Login/Registro** - Autenticação deve funcionar

### 4.2 Verificar Banco de Dados
1. No Supabase, vá para **Table Editor**
2. Verifique se as tabelas foram criadas
3. Teste inserindo dados via interface

## Passo 5: Configurações Adicionais

### 5.1 Domínio Personalizado (Opcional)
1. No Render, vá para **Settings**
2. Na seção "Custom Domains"
3. Adicione seu domínio
4. Configure DNS conforme instruções

### 5.2 Monitoramento
1. **Logs**: Render Dashboard → Logs
2. **Database**: Supabase Dashboard
3. **Performance**: Render Metrics

## 🔧 Troubleshooting

### Erro de Build
```bash
# Se der erro de dependências:
npm install --legacy-peer-deps
```

### Erro de Variáveis de Ambiente
- Verifique se as variáveis estão corretas no Render
- Certifique-se que começam com `VITE_`

### Erro de Database
- Verifique se a migração SQL foi executada
- Confirme se o RLS está configurado

### Erro de Storage
- Verifique se o bucket "photos" existe
- Confirme se está marcado como público

## 📞 Suporte

Se encontrar problemas:

1. **Logs do Render**: Verifique os logs de build e runtime
2. **Supabase Logs**: Verifique logs de API e Auth
3. **GitHub Issues**: Crie uma issue no repositório

## 🎉 Sucesso!

Sua aplicação Galeria Secreta está agora online e funcionando!

**URL da aplicação**: Será fornecida pelo Render
**Painel admin**: Acesse via Supabase Dashboard