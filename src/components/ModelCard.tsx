import React from 'react';
import { Model } from '../lib/supabase';
import { Star, MapPin, Phone, MessageCircle, Heart, Eye, Calendar } from 'lucide-react';

interface ModelCardProps {
  model: Model;
  onViewProfile: (model: Model) => void;
  onContact: (model: Model) => void;
  onBook: (model: Model) => void;
  onFavorite?: (model: Model) => void;
  isFavorite?: boolean;
  currentUser?: any;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onViewProfile,
  onContact,
  onBook,
  onFavorite,
  isFavorite = false,
  currentUser
}) => {
  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.whatsapp) {
      const message = encodeURIComponent(
        `Olá ${model.stage_name}! Vi o seu perfil na Galeria Secreta e gostaria de saber mais sobre os seus serviços.`
      );
      const whatsappNumber = model.whatsapp.replace(/[^\d]/g, '');
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(model);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(model);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBook(model);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(model);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Elite':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Exclusiva':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Experiente':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="model-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
      <div className="relative">
        <img
          src={model.main_photo_url || '/placeholder-model.jpg'}
          alt={model.stage_name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button
              onClick={handleViewProfile}
              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Ver Perfil"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={handleWhatsAppContact}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
              title="WhatsApp"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={handleContact}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Mensagem"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(model.category)}`}>
            {model.category}
          </span>
        </div>

        {/* Featured badge */}
        {model.is_featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              ⭐ DESTAQUE
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center bg-black bg-opacity-50 rounded-full px-3 py-1">
          <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
          <span className="text-white text-sm font-medium">{model.rating.toFixed(1)}</span>
          <span className="text-white text-sm ml-1">({model.total_reviews})</span>
        </div>

        {/* Favorite button */}
        {currentUser && (
          <button
            onClick={handleFavorite}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-all"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
            />
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              {model.stage_name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{model.location} • {model.age} anos</span>
            </div>
            
            {/* Languages */}
            {model.languages && model.languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {model.languages.slice(0, 3).map((language, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {language}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {model.hourly_rate && (
            <div className="text-right ml-4">
              <div className="text-lg font-bold text-primary-600">
                {model.hourly_rate.toLocaleString('pt-MZ')} MT
              </div>
              <div className="text-sm text-gray-500">por hora</div>
            </div>
          )}
        </div>

        {model.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {model.bio}
          </p>
        )}

        {/* Specialties */}
        {model.specialties.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {model.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200"
                >
                  {specialty}
                </span>
              ))}
              {model.specialties.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{model.specialties.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Disponível: {model.availability}</span>
          <span>{model.total_bookings} reservas</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Perfil
          </button>
          
          <button
            onClick={handleBook}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            title="Reservar"
          >
            <Calendar className="w-4 h-4" />
            Reservar
          </button>
        </div>

        {/* Verification status */}
        {model.verification_status === 'verified' && (
          <div className="mt-3 flex items-center justify-center">
            <span className="text-green-600 text-xs font-medium flex items-center gap-1">
              ✓ Perfil Verificado
            </span>
          </div>
        )}
      </div>
    </div>
  );
};