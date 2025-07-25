import React, { useState, useEffect } from 'react';
import { ModelCard } from './components/ModelCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Model, User, Candidatura } from './lib/supabase';
import { ModelServiceClass } from './services/modelService';
import { CandidaturaService } from './services/candidaturaService';
import { AuthService } from './services/authService';
import { NotificationService } from './services/notificationService';
import { 
  Menu, 
  X, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  User as UserIcon,
  LogOut,
  MessageCircle,
  Calendar,
  Heart,
  Bell,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function App() {
  // State management
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Application form state
  const [applicationData, setApplicationData] = useState({
    nome: '',
    idade: '',
    provincia: '',
    cidade: '',
    email: '',
    whatsapp: '',
    instagram: '',
    foto: null as File | null,
    fotos_adicionais: [] as File[],
    experiencia: '',
    motivacao: '',
    disponibilidade: '',
    expectativas_financeiras: '',
    termos_aceitos: false
  });

  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [applicationMessage, setApplicationMessage] = useState('');

  const categories = ['Profissional', 'Experiente', 'Premium', 'Exclusiva', 'VIP', 'Elite'];
  const provincias = [
    'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 
    'Maputo (Cidade)', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia'
  ];

  // Load initial data
  useEffect(() => {
    loadModels();
    checkAuthState();
  }, []);

  // Filter models when search or category changes
  useEffect(() => {
    filterModels();
  }, [models, searchQuery, selectedCategory]);

  // Load notifications when user changes
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [currentUser]);

  const loadModels = async () => {
    setIsLoading(true);
    const { data, error } = await ModelServiceClass.getAllModels();
    if (data) {
      setModels(data);
    } else if (error) {
      console.error('Error loading models:', error);
    }
    setIsLoading(false);
  };

  const checkAuthState = async () => {
    const { data } = await AuthService.getCurrentUser();
    setCurrentUser(data);
  };

  const loadNotifications = async () => {
    if (!currentUser) return;
    
    const { data } = await NotificationService.getUserNotifications(currentUser.id);
    if (data) {
      setNotifications(data);
    }

    const { data: count } = await NotificationService.getUnreadCount(currentUser.id);
    setUnreadCount(count);
  };

  const subscribeToNotifications = () => {
    if (!currentUser) return;

    return NotificationService.subscribeToNotifications(currentUser.id, (payload) => {
      setNotifications(prev => [payload.new, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  };

  const filterModels = () => {
    let filtered = models;

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.stage_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    setFilteredModels(filtered);
  };

  const handleViewProfile = (model: Model) => {
    setSelectedModel(model);
    setIsProfileModalOpen(true);
  };

  const handleContact = (model: Model) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // Implement messaging functionality
    console.log('Contact model:', model.stage_name);
    alert('Funcionalidade de mensagens será implementada em breve!');
  };

  const handleBook = (model: Model) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedModel(model);
    setIsBookingModalOpen(true);
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    setCurrentUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.termos_aceitos) {
      alert('Você deve aceitar os termos e condições.');
      return;
    }

    if (parseInt(applicationData.idade) < 18 || parseInt(applicationData.idade) > 65) {
      alert('A idade deve estar entre 18 e 65 anos.');
      return;
    }

    setApplicationStatus('submitting');

    try {
      let fotoUrl = '';
      let fotosAdicionaisUrls: string[] = [];
      
      // Upload main photo
      if (applicationData.foto) {
        const { data: photoUrl, error: photoError } = await CandidaturaService.uploadCandidaturaPhoto(
          applicationData.foto,
          `candidatura_${Date.now()}`
        );
        
        if (photoError) throw photoError;
        fotoUrl = photoUrl || '';
      }

      // Upload additional photos
      if (applicationData.fotos_adicionais.length > 0) {
        for (let i = 0; i < applicationData.fotos_adicionais.length; i++) {
          const file = applicationData.fotos_adicionais[i];
          const { data: photoUrl, error: photoError } = await CandidaturaService.uploadCandidaturaPhoto(
            file,
            `candidatura_${Date.now()}_${i}`
          );
          
          if (photoError) throw photoError;
          if (photoUrl) fotosAdicionaisUrls.push(photoUrl);
        }
      }

      const candidaturaData: Omit<Candidatura, 'id' | 'status' | 'created_at' | 'updated_at'> = {
        nome: applicationData.nome,
        idade: parseInt(applicationData.idade),
        pais: 'Moçambique',
        provincia: applicationData.provincia,
        cidade: applicationData.cidade || undefined,
        email: applicationData.email,
        whatsapp: applicationData.whatsapp,
        instagram: applicationData.instagram || undefined,
        foto_url: fotoUrl || undefined,
        fotos_adicionais: fotosAdicionaisUrls,
        experiencia: applicationData.experiencia || undefined,
        motivacao: applicationData.motivacao || undefined,
        disponibilidade: applicationData.disponibilidade || undefined,
        expectativas_financeiras: applicationData.expectativas_financeiras || undefined,
        termos_aceitos: applicationData.termos_aceitos
      };

      const { data, error } = await CandidaturaService.submitCandidatura(candidaturaData);

      if (error) throw error;

      setApplicationStatus('success');
      setApplicationMessage('Candidatura enviada com sucesso! Entraremos em contacto em breve.');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowApplicationForm(false);
        setApplicationStatus('idle');
        setApplicationData({
          nome: '',
          idade: '',
          provincia: '',
          cidade: '',
          email: '',
          whatsapp: '',
          instagram: '',
          foto: null,
          fotos_adicionais: [],
          experiencia: '',
          motivacao: '',
          disponibilidade: '',
          expectativas_financeiras: '',
          termos_aceitos: false
        });
      }, 3000);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      setApplicationStatus('error');
      setApplicationMessage('Erro ao enviar candidatura: ' + error.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const files = e.target.files;
    if (!files) return;

    if (isMain) {
      setApplicationData(prev => ({ ...prev, foto: files[0] }));
    } else {
      const additionalFiles = Array.from(files).slice(0, 5); // Max 5 additional photos
      setApplicationData(prev => ({ ...prev, fotos_adicionais: additionalFiles }));
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId, currentUser!.id);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Galeria Secreta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 font-cormorant">
                Galeria Secreta
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Quero Fazer Parte
              </button>
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b">
                          <h3 className="font-semibold text-gray-900">Notificações</h3>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Nenhuma notificação
                          </div>
                        ) : (
                          <div className="divide-y">
                            {notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                  !notification.is_read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                                  }`} />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {notification.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                      {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-gray-700">Olá, {currentUser.full_name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Criar Conta
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowApplicationForm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Quero Fazer Parte
                </button>
                
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 text-gray-700">Olá, {currentUser.full_name}</div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Criar Conta
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-cormorant">
            Galeria <span className="text-yellow-400">Secreta</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Descubra um mundo exclusivo de elegância e sofisticação. 
            Junte-se à nossa comunidade seleta de modelos profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowApplicationForm(true)}
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Quero Fazer Parte
            </button>
            <button
              onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Ver Modelos
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, localização ou especialidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-cormorant">
              Nossas Modelos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conheça nossa seleção exclusiva de modelos profissionais, 
              cada uma com sua personalidade única e serviços especializados.
            </p>
          </div>

          {filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery || selectedCategory 
                  ? 'Nenhuma modelo encontrada com os filtros aplicados.' 
                  : 'Carregando modelos...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                  onBook={handleBook}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Candidatura para Modelo</h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {applicationStatus === 'success' ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Candidatura Enviada com Sucesso!
                </h3>
                <p className="text-gray-600 mb-4">{applicationMessage}</p>
                <p className="text-sm text-gray-500">
                  Entraremos em contacto em breve através do WhatsApp ou email fornecido.
                </p>
              </div>
            ) : applicationStatus === 'error' ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Erro ao Enviar Candidatura
                </h3>
                <p className="text-gray-600 mb-4">{applicationMessage}</p>
                <button
                  onClick={() => setApplicationStatus('idle')}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={applicationData.nome}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idade *
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="65"
                        value={applicationData.idade}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, idade: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Província *
                      </label>
                      <select
                        value={applicationData.provincia}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, provincia: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {provincias.map(provincia => (
                          <option key={provincia} value={provincia}>{provincia}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={applicationData.cidade}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, cidade: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={applicationData.whatsapp}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram (opcional)
                      </label>
                      <input
                        type="text"
                        value={applicationData.instagram}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="@seu_instagram"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fotos</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Principal *
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, true)}
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fotos Adicionais (máximo 5)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange(e, false)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiência Anterior
                      </label>
                      <textarea
                        value={applicationData.experiencia}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, experiencia: e.target.value }))}
                        rows={3}
                        placeholder="Descreva sua experiência anterior em modelagem, eventos ou áreas relacionadas..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivação
                      </label>
                      <textarea
                        value={applicationData.motivacao}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, motivacao: e.target.value }))}
                        rows={3}
                        placeholder="Por que gostaria de fazer parte da Galeria Secreta?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disponibilidade
                      </label>
                      <textarea
                        value={applicationData.disponibilidade}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, disponibilidade: e.target.value }))}
                        rows={2}
                        placeholder="Qual é a sua disponibilidade de horários?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expectativas Financeiras
                      </label>
                      <textarea
                        value={applicationData.expectativas_financeiras}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, expectativas_financeiras: e.target.value }))}
                        rows={2}
                        placeholder="Quais são suas expectativas em relação à remuneração?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termos"
                    checked={applicationData.termos_aceitos}
                    onChange={(e) => setApplicationData(prev => ({ 
                      ...prev, 
                      termos_aceitos: e.target.checked 
                    }))}
                    required
                    className="mt-1 mr-3"
                  />
                  <label htmlFor="termos" className="text-sm text-gray-700">
                    Concordo com os termos e condições da Galeria Secreta e autorizo o tratamento dos meus dados pessoais 
                    para fins de recrutamento e seleção. Confirmo que tenho mais de 18 anos e que todas as informações 
                    fornecidas são verdadeiras. *
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={applicationStatus === 'submitting'}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {applicationStatus === 'submitting' ? 'Enviando...' : 'Enviar Candidatura'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cormorant">Contacto</h2>
            <p className="text-xl text-gray-300">
              Entre em contacto connosco para mais informações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center p-6 bg-gray-800 rounded-lg">
              <Phone className="w-8 h-8 mr-4 text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Telefone</h3>
                <a href="tel:+258853131185" className="text-primary-400 hover:text-primary-300">
                  +258 853131185
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 bg-gray-800 rounded-lg">
              <Mail className="w-8 h-8 mr-4 text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Email</h3>
                <a 
                  href="mailto:galeriasecretamocambique@gmail.com" 
                  className="text-primary-400 hover:text-primary-300"
                >
                  galeriasecretamocambique@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-400 mb-2 font-cormorant">Galeria Secreta</h3>
            <p className="text-gray-400 mb-4">Elegância e Sofisticação</p>
            <p className="text-sm text-gray-500">
              © 2024 Galeria Secreta. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        model={selectedModel!}
        onSuccess={() => {
          loadNotifications(); // Reload notifications after booking
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={checkAuthState}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        model={selectedModel!}
        onBook={handleBook}
        onContact={handleContact}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;