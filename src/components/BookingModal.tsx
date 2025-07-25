import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CreditCard, User, Phone } from 'lucide-react';
import { Model, Service, ModelService } from '../lib/supabase';
import { BookingService } from '../services/bookingService';
import { ModelServiceClass } from '../services/modelService';
import { AuthService } from '../services/authService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: Model;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  model,
  onSuccess
}) => {
  const [modelServices, setModelServices] = useState<ModelService[]>([]);
  const [selectedService, setSelectedService] = useState<ModelService | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [location, setLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCurrentUser();
      loadModelServices();
    }
  }, [isOpen, model.id]);

  const loadCurrentUser = async () => {
    const { data } = await AuthService.getCurrentUser();
    setCurrentUser(data);
  };

  const loadModelServices = async () => {
    const { data, error } = await ModelServiceClass.getModelServices(model.id);
    if (data) {
      setModelServices(data);
      if (data.length > 0) {
        setSelectedService(data[0]);
        setDuration(data[0].service?.duration_hours || 1);
      }
    } else if (error) {
      console.error('Error loading services:', error);
    }
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    const basePrice = selectedService.custom_price || selectedService.service?.base_price || model.hourly_rate || 0;
    return basePrice * duration;
  };

  const calculateDeposit = () => {
    const total = calculateTotal();
    return Math.round(total * 0.3); // 30% deposit
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedService) {
      newErrors.service = 'Selecione um serviço';
    }

    if (!bookingDate) {
      newErrors.date = 'Selecione uma data';
    } else {
      const selectedDate = new Date(`${bookingDate}T${bookingTime || '00:00'}`);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = 'A data deve ser no futuro';
      }
    }

    if (!bookingTime) {
      newErrors.time = 'Selecione um horário';
    }

    if (duration < 1) {
      newErrors.duration = 'Duração mínima é 1 hora';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Você precisa estar logado para fazer uma reserva.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
      const totalAmount = calculateTotal();
      const depositAmount = calculateDeposit();
      
      const { data, error } = await BookingService.createBooking({
        client_id: currentUser.id,
        model_id: model.id,
        service_id: selectedService!.service!.id,
        booking_date: bookingDateTime.toISOString(),
        duration_hours: duration,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        location: location || null,
        special_requests: specialRequests || null,
        client_notes: clientNotes || null
      });

      if (error) throw error;

      alert('Reserva criada com sucesso! Aguarde a confirmação da modelo.');
      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      resetForm();
      
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      alert('Erro ao criar reserva: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setBookingDate('');
    setBookingTime('');
    setDuration(1);
    setLocation('');
    setSpecialRequests('');
    setClientNotes('');
    setErrors({});
  };

  const handleServiceSelect = (service: ModelService) => {
    setSelectedService(service);
    setDuration(service.custom_duration || service.service?.duration_hours || 1);
    setErrors(prev => ({ ...prev, service: '' }));
  };

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split('T')[0];
  const minTime = new Date().getHours() < 23 ? 
    `${String(new Date().getHours() + 1).padStart(2, '0')}:00` : 
    '09:00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reservar com {model.stage_name}
            </h2>
            <p className="text-gray-600 mt-1">
              {model.location} • {model.category}
            </p>
          </div>
          <button
            onClick={onClose}
           className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
           type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!currentUser ? (
          <div className="p-6 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Login Necessário
            </h3>
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para fazer uma reserva.
            </p>
            <button
              onClick={onClose}
             className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
             type="button"
            >
              Fazer Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione o Serviço *
              </label>
              {modelServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Carregando serviços...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {modelServices.map((modelService) => (
                    <div
                      key={modelService.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService?.id === modelService.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceSelect(modelService)}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         handleServiceSelect(modelService);
                       }
                     }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{modelService.service?.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {modelService.service?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {modelService.service?.description}
                            </p>
                            {modelService.special_notes && (
                              <p className="text-sm text-blue-600 mt-1">
                                {modelService.special_notes}
                              </p>
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
              {errors.service && (
                <p className="text-red-500 text-sm mt-1">{errors.service}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setErrors(prev => ({ ...prev, date: '' }));
                  }}
                  min={minDate}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hora *
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => {
                    setBookingTime(e.target.value);
                    setErrors(prev => ({ ...prev, time: '' }));
                  }}
                  min={bookingDate === minDate ? minTime : undefined}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (horas) *
              </label>
              <select
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  setErrors(prev => ({ ...prev, duration: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {[1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} {hours === 1 ? 'hora' : 'horas'}
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Local do Encontro
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Hotel, Restaurante, Evento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pedidos Especiais
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Alguma preferência ou pedido especial..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Client Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Pessoais
              </label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={2}
                placeholder="Informações adicionais que gostaria de compartilhar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contacto Direto
              </h4>
              <p className="text-blue-800 text-sm mb-2">
                Para confirmação imediata, pode contactar diretamente:
              </p>
              <a
                href={`https://wa.me/${model.whatsapp?.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                WhatsApp: {model.whatsapp}
              </a>
            </div>

            {/* Total */}
            {selectedService && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Serviço:</span>
                    <span>{selectedService.service?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duração:</span>
                    <span>{duration} {duration === 1 ? 'hora' : 'horas'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preço por hora:</span>
                    <span>{(selectedService.custom_price || selectedService.service?.base_price || 0).toLocaleString('pt-MZ')} MT</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Total:
                    </span>
                    <span className="text-primary-600">
                      {calculateTotal().toLocaleString('pt-MZ')} MT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Depósito (30%):</span>
                    <span>{calculateDeposit().toLocaleString('pt-MZ')} MT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedService}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};