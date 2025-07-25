# Galeria Secreta

Uma plataforma elegante e sofisticada para modelos profissionais em Moçambique.

## 🌐 Deploy no Render

### Pré-requisitos
1. Conta no [Render](https://render.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório no GitHub

### Passos para Deploy

#### 1. Configurar Supabase
1. Crie um projeto no Supabase
2. Vá para SQL Editor e execute o script de migração em `supabase/migrations/001_initial_schema.sql`
3. Configure o Storage:
   - Vá para Storage
   - Crie um bucket chamado "photos"
   - Configure como público
4. Anote as credenciais:
   - Project URL
   - Anon Key

#### 2. Deploy no Render
1. Faça login no [Render](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: galeria-secreta
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: Free (ou pago se preferir)

#### 3. Configurar Variáveis de Ambiente
No painel do Render, vá para "Environment" e adicione:
```
NODE_ENV=production
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

#### 4. Deploy Automático
- O Render fará deploy automático a cada push no GitHub
- O primeiro deploy pode levar alguns minutos

## 🚀 Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Galeria de acompanhantes
- ✅ Formulário de candidatura integrado com Supabase
- ✅ Upload de fotos
- ✅ Validação de formulários
- ✅ Notificações em tempo real
- ✅ Sistema de autenticação completo
- ✅ Sistema de reservas
- ✅ Chat em tempo real
- ✅ Sistema de avaliações

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS personalizado com design sofisticado
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage para fotos
- **Deploy**: Render.com
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Para produção no Render, configure as variáveis no painel de controle.

### 2. Configuração do Supabase

1. **Criar projeto no Supabase**
2. **Executar a migração SQL** (arquivo: `supabase/migrations/001_initial_schema.sql`)
3. **Criar bucket de storage** chamado `fotos` (público)
4. **Configurar políticas de RLS** (já incluídas na migração)

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 📊 Estrutura do Banco de Dados

### Principais Tabelas:

#### `users` - Usuários do sistema
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| email | text | Email único |
| full_name | text | Nome completo |
| role | text | Papel (client/admin/model) |

#### `models` - Modelos/Acompanhantes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| stage_name | text | Nome artístico |
| age | integer | Idade |
| category | text | Categoria da modelo |
| hourly_rate | decimal | Preço por hora |

#### `candidaturas` - Candidaturas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| nome | text | Nome completo |
| idade | integer | Idade (18-65) |
| pais | text | País (padrão: Moçambique) |
| provincia | text | Província |
| email | text | Email |
| whatsapp | text | WhatsApp |
| foto_url | text | URL da foto |
| termos_aceitos | boolean | Aceitação dos termos |
| status | text | Status da candidatura |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

#### `bookings` - Reservas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| client_id | uuid | ID do cliente |
| model_id | uuid | ID da modelo |
| booking_date | timestamptz | Data da reserva |
| total_amount | decimal | Valor total |
| status | text | Status da reserva |

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado
- **Políticas de acesso** configuradas
- **Validação de arquivos** no frontend
- **Sanitização de dados** antes da inserção

## 🚀 URLs de Deploy

### Produção
- **URL**: Será fornecida pelo Render após o deploy
- **Admin**: Acesso via painel do Supabase

### Monitoramento
- **Logs**: Disponíveis no painel do Render
- **Database**: Painel do Supabase
- **Analytics**: Supabase Analytics

## 📱 Funcionalidades Principais

### Para Candidatas
- Formulário de candidatura completo
- Upload de foto profissional
- Validação em tempo real
- Feedback imediato

### Para Administradores
- Visualização de candidaturas no Supabase Dashboard
- Gestão de status das candidaturas
- Acesso às fotos enviadas

## 🎨 Design

- **Tema**: Elegante e sofisticado
- **Cores**: Dourado e preto
- **Tipografia**: Cormorant Garamond + Poppins
- **Responsivo**: Mobile-first design

## 📞 Suporte

Para suporte técnico, entre em contacto:
- **Email**: galeriasecretamocambique@gmail.com
- **WhatsApp**: +258 853131185

---

© 2024 Galeria Secreta. Todos os direitos reservados.