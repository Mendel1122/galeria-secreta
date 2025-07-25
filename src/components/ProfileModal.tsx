import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, MessageCircle, Calendar, Heart, Instagram, Twitter, Globe } from 'lucide-react';
import { Model, Review, ModelService } from '../lib/supabase';
import { ModelServiceClass } from '../services/modelService';
import { ReviewService } from '../services/reviewService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: Model;
  onBook: (model: Model) => void;
  onContact: (model: Model) => void;
  currentUser?: any;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  model,
  onBook,
  onContact,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'services' | 'reviews'>('about');
  const [modelServices, setModelServices] = useState<ModelService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && model) {
      loadModelData();
    }
  }, [isOpen, model]);

  const loadModelData = async () => {
    setIsLoading(true);
    
    // Load services
    const { data: services } = await ModelServiceClass.getModelServices(model.id);
    if (services) {
      setModelServices(services);
    }

    // Load reviews
    const { data: reviewsData } = await ReviewService.getModelReviews(model.id);
    if (reviewsData) {
      setReviews(reviewsData);
    }

    setIsLoading(false);
  };

  const handleWhatsAppContact = () => {
    if (model.whatsapp) {
      const message = encodeURIComponent(
        `Olá ${model.stage_name}! Vi o seu perfil completo na Galeria Secreta e gostaria de conversar sobre seus serviços.`
      );
      const whatsappNumber = model.whatsapp.replace(/[^\d]/g, '');
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const openImageFullscreen = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageFullscreen = () => {
    setSelectedImage(null);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'Sobre', icon: '👤' },
    { id: 'gallery', label: 'Galeria', icon: '📸' },
    { id: 'services', label: 'Serviços', icon: '💼' },
    { id: 'reviews', label: 'Avaliações', icon: '⭐' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <div className="flex items-center gap-4">
              <img
                src={model.main_photo_url || '/placeholder-model.jpg'}
                alt={model.stage_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div>
                <h2 className="text-2xl font-bold">{model.stage_name}</h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {model.location} • {model.age} anos
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {model.rating.toFixed(1)} ({model.total_reviews} avaliações)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                type="button"
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre Mim</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {model.bio || 'Informações sobre a modelo não disponíveis.'}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Detalhes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoria:</span>
                        <span className="font-medium">{model.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponibilidade:</span>
                        <span className="font-medium">{model.availability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Reservas:</span>
                        <span className="font-medium">{model.total_bookings}</span>
                      </div>
                      {model.hourly_rate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço por hora:</span>
                          <span className="font-medium text-primary-600">
                            {model.hourly_rate.toLocaleString('pt-MZ')} MT
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Especialidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {model.languages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Idiomas</h4>
                        <div className="flex flex-wrap gap-2">
                          {model.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(model.instagram || model.twitter) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Redes Sociais</h4>
                    <div className="flex gap-3">
                      {model.instagram && (
                        <a
                          href={model.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                        >
                          <Instagram className="w-5 h-5" />
                          Instagram
                        </a>
                      )}
                      {model.twitter && (
                        <a
                          href={model.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Twitter className="w-5 h-5" />
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Galeria de Fotos</h3>
                {model.gallery_photos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma foto adicional disponível.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {model.gallery_photos.map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImageFullscreen(photo)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openImageFullscreen(photo);
                          }
                        }}
                      >
                        <img
                          src={photo}
                          alt={`Foto ${index + 1} de ${model.stage_name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Oferecidos</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando serviços...</p>
                  </div>
                ) : modelServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum serviço específico cadastrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modelServices.map((modelService) => (
                      <div
                        key={modelService.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{modelService.service?.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {modelService.service?.name}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {modelService.service?.description}
                              </p>
                              {modelService.special_notes && (
                                <p className="text-blue-600 text-sm mt-2">
                                  <strong>Nota especial:</strong> {modelService.special_notes}
                                </p>
                              )}
                              {modelService.service?.includes && modelService.service.includes.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-700">Inclui:</p>
                                  <ul className="text-sm text-gray-600 mt-1">
                                    {modelService.service.includes.map((item, index) => (
                                      <li key={index} className="flex items-center gap-1">
                                        <span className="text-green-500">✓</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-600">
                              {(modelService.custom_price || modelService.service?.base_price || 0).toLocaleString('pt-MZ')} MT
                            </div>
                            <div className="text-sm text-gray-500">
                              {modelService.custom_duration || modelService.service?.duration_hours || 1}h base
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Avaliações ({reviews.length})
                </h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando avaliações...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma avaliação disponível ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">
                                {review.is_anonymous ? 'Cliente Anônimo' : review.client?.full_name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {review.is_verified && (
                            <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded">
                              ✓ Verificado
                            </span>
                          )}
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                        )}

                        {review.pros.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-green-700 mb-1">Pontos Positivos:</p>
                            <div className="flex flex-wrap gap-1">
                              {review.pros.map((pro, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                >
                                  {pro}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {review.response_from_model && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Resposta de {model.stage_name}:
                            </p>
                            <p className="text-sm text-gray-700">{review.response_from_model}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleWhatsAppContact}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <Phone className="w-5 h-5" />
                WhatsApp
              </button>
              
              <button
                onClick={() => onContact(model)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <MessageCircle className="w-5 h-5" />
                Mensagem
              </button>
              
              <button
                onClick={() => onBook(model)}
                className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <Calendar className="w-5 h-5" />
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={closeImageFullscreen}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Foto em tela cheia"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closeImageFullscreen}
             className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all cursor-pointer"
             type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};