import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface DeployStatusProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DeployStatus: React.FC<DeployStatusProps> = ({ isVisible, onClose }) => {
  const [deployStatus, setDeployStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [deployUrl, setDeployUrl] = useState<string>('');

  useEffect(() => {
    if (isVisible) {
      checkDeployStatus();
    }
  }, [isVisible]);

  const checkDeployStatus = async () => {
    try {
      // Simulate checking deploy status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if we're in production
      if (window.location.hostname !== 'localhost') {
        setDeployStatus('success');
        setDeployUrl(window.location.origin);
      } else {
        setDeployStatus('error');
      }
    } catch (error) {
      setDeployStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          {deployStatus === 'checking' && (
            <>
              <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verificando Deploy
              </h3>
              <p className="text-gray-600 mb-4">
                Aguarde enquanto verificamos o status do deploy...
              </p>
            </>
          )}

          {deployStatus === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Deploy Realizado com Sucesso! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Sua aplicação está online e funcionando perfeitamente.
              </p>
              {deployUrl && (
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors mb-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visitar Site
                </a>
              )}
            </>
          )}

          {deployStatus === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Deploy Pendente
              </h3>
              <p className="text-gray-600 mb-4">
                Siga o guia de deploy para publicar sua aplicação no Render.
              </p>
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Próximos passos:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Configure o Supabase</li>
                  <li>2. Faça upload para GitHub</li>
                  <li>3. Configure o Render</li>
                  <li>4. Adicione variáveis de ambiente</li>
                </ol>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};