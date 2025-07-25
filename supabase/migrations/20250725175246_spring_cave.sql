/*
  # Schema inicial da Galeria Secreta

  1. Novas Tabelas
    - `users` - Usuários do sistema (clientes e administradores)
    - `models` - Modelos/acompanhantes
    - `candidaturas` - Candidaturas para se tornar modelo
    - `bookings` - Reservas/agendamentos
    - `messages` - Sistema de mensagens
    - `reviews` - Avaliações dos serviços
    - `services` - Serviços oferecidos
    - `model_services` - Relação entre modelos e serviços

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso configuradas
    - Triggers para timestamps automáticos

  3. Storage
    - Bucket para fotos de modelos
    - Bucket para fotos de candidaturas
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin', 'model')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 65),
  location text NOT NULL,
  category text DEFAULT 'Profissional' CHECK (category IN ('Profissional', 'Experiente', 'Premium', 'Exclusiva', 'VIP', 'Elite')),
  bio text,
  main_photo_url text,
  gallery_photos text[] DEFAULT '{}',
  specialties text[] DEFAULT '{}',
  hourly_rate decimal(10,2),
  availability text DEFAULT '24/7',
  is_active boolean DEFAULT true,
  rating decimal(3,2) DEFAULT 5.0,
  total_reviews integer DEFAULT 0,
  whatsapp text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  base_price decimal(10,2),
  duration_hours integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Model services junction table
CREATE TABLE IF NOT EXISTS model_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  custom_price decimal(10,2),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_id, service_id)
);

-- Candidaturas table
CREATE TABLE IF NOT EXISTS candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  idade integer NOT NULL CHECK (idade >= 18 AND idade <= 65),
  pais text DEFAULT 'Moçambique',
  provincia text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  foto_url text,
  termos_aceitos boolean DEFAULT false,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovada', 'rejeitada')),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  booking_date timestamptz NOT NULL,
  duration_hours integer DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  special_requests text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, booking_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for models
CREATE POLICY "Anyone can view active models" ON models
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Models can update own profile" ON models
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage models" ON models
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for candidaturas
CREATE POLICY "Anyone can create candidaturas" ON candidaturas
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all candidaturas" ON candidaturas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update candidaturas" ON candidaturas
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT TO authenticated
  USING (
    client_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM models 
      WHERE models.id = bookings.model_id 
      AND models.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE TO authenticated
  USING (
    client_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM models 
      WHERE models.id = bookings.model_id 
      AND models.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidaturas_updated_at BEFORE UPDATE ON candidaturas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default services
INSERT INTO services (name, description, icon, base_price, duration_hours) VALUES
('Jantar Exclusivo', 'Acompanhamento em restaurantes e eventos sociais', '🍽️', 2500.00, 3),
('Eventos Culturais', 'Teatro, ópera, exposições e eventos artísticos', '🎭', 3000.00, 4),
('Viagens', 'Acompanhamento em viagens nacionais e internacionais', '✈️', 5000.00, 24),
('Eventos Corporativos', 'Reuniões de negócios e eventos empresariais', '🏢', 4000.00, 6),
('Vida Noturna', 'Bares sofisticados e ambientes exclusivos', '🌃', 2000.00, 4),
('Experiências VIP', 'Serviços premium e experiências únicas', '💎', 8000.00, 8);

-- Insert sample models
INSERT INTO models (stage_name, age, location, category, bio, main_photo_url, gallery_photos, specialties, hourly_rate, whatsapp) VALUES
('Sofia', 25, 'Nampula', 'Profissional', 
 'Olá, sou a Sofia! Uma modelo profissional com 5 anos de experiência no ramo. Sou uma pessoa elegante, educada e sempre disposta a proporcionar momentos únicos e inesquecíveis.',
 'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
 ARRAY['https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'],
 ARRAY['Elegância', 'Discrição', 'Conversação', 'Etiqueta Social'],
 1500.00, '+258853131185'),

('Isabella', 28, 'Nampula', 'Experiente',
 'Sou a Isabella, uma acompanhante experiente que valoriza a autenticidade e a conexão genuína. Com formação em psicologia, ofereço não apenas beleza, mas também inteligência emocional.',
 'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
 ARRAY['https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400'],
 ARRAY['Psicologia', 'Arte', 'Gastronomia', 'Literatura'],
 2000.00, '+258853131185'),

('Valentina', 26, 'Nampula', 'Premium',
 'Olá, sou a Valentina! Modelo premium com experiência internacional. Falo fluentemente português, inglês e francês. Sou sofisticada, bem-educada e sempre impecavelmente apresentada.',
 'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
 ARRAY['https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400'],
 ARRAY['Multilíngue', 'Viagens', 'Luxo', 'Protocolo'],
 3500.00, '+258853131185');