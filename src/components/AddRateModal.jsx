import React, { useState } from 'react';
import { ratesService } from '../services/api';
import PropTypes from 'prop-types';

function AddRateModal({ isOpen, onClose, onSuccess, showAlert }) {
  const [formData, setFormData] = useState({
    idOp: '',
    tasa: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'idOp') {
      // Solo permitir números enteros positivos
      const numValue = parseInt(value, 10);
      if (!value || (numValue > 0 && /^\d+$/.test(value))) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'tasa') {
      // Permitir números decimales positivos
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      showAlert('El formato del correo electrónico no es válido', 'info');
      return;
    }

    // Validar formato de tasa
    const tasaValue = parseFloat(formData.tasa);
    if (isNaN(tasaValue) || tasaValue < 0) {
      showAlert('La tasa debe ser un número positivo', 'info');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        idOp: parseInt(formData.idOp, 10),
        tasa: tasaValue,
        email: formData.email.trim()
      };

      // Validaciones adicionales
      if (!Number.isInteger(payload.idOp) || payload.idOp <= 0) {
        throw new Error('El ID de operación debe ser un número entero positivo');
      }

      if (payload.tasa < 0) {
        throw new Error('La tasa debe ser un número decimal positivo');
      }

      await ratesService.createRate(payload);
      showAlert('Tasa agregada correctamente', 'success');
      onSuccess();
      onClose();
      setFormData({ idOp: '', tasa: '', email: '' });
    } catch (err) {
      console.error('Error:', err);
      let errorMessage = 'Error al agregar la tasa';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ idOp: '', tasa: '', email: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-8 w-full max-w-[480px] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Agregar Nuevo Registro</h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">Ingresa los datos del nuevo registro</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1 sm:mb-2">
              ID Operación
            </label>
            <input
              type="number"
              name="idOp"
              value={formData.idOp}
              onChange={handleInputChange}
              min="1"
              step="1"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
              placeholder="Ingresa el ID de operación"
              onKeyDown={(e) => {
                if (e.key === 'e' || e.key === '-' || e.key === '+' || e.key === '.') {
                  e.preventDefault();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1 sm:mb-2">
              Tasa
            </label>
            <input
              type="text"
              name="tasa"
              value={formData.tasa}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
              placeholder="0.00"
              title="Ingrese un número decimal positivo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
              placeholder="ejemplo@xepelin.com"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-[#4F46E5] rounded-xl hover:bg-[#4338CA] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Agregando...</span>
                </div>
              ) : (
                'Agregar Registro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddRateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  showAlert: PropTypes.func.isRequired
};

export default AddRateModal; 