import React, { useState, useEffect } from 'react';
import { ratesService } from '../services/api';
import PropTypes from 'prop-types';

function EditRateModal({ isOpen, onClose, rate, onSuccess, showAlert }) {
  const [newRate, setNewRate] = useState(rate?.tasa ? rate.tasa.toFixed(2) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rate?.tasa) {
      setNewRate(rate.tasa.toFixed(2));
    }
  }, [rate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tasaNumero = parseFloat(newRate);
    
    if (isNaN(tasaNumero)) {
      showAlert('Por favor ingrese un número válido', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ratesService.updateRate(rate.idOp, {
        tasa: tasaNumero,
        email: rate.email
      });

      if (response.message?.includes('ya es la misma')) {
        showAlert('La tasa ingresada es igual a la existente', 'info');
      } else {
        showAlert('Tasa actualizada correctamente', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating rate:', err);
      showAlert(err.response?.data?.detail || 'Error al actualizar la tasa', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (value === '' || value === '.') {
      setNewRate(value);
      return;
    }

    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      setNewRate(value);
    }
  };

  const handleBlur = () => {
    if (newRate && !isNaN(parseFloat(newRate))) {
      setNewRate(parseFloat(newRate).toFixed(2));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Editar Tasa</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Operación
            </label>
            <input
              type="text"
              value={rate?.idOp}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Tasa
            </label>
            <input
              type="text"
              value={newRate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditRateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  showAlert: PropTypes.func.isRequired,
  rate: PropTypes.shape({
    idOp: PropTypes.number.isRequired,
    tasa: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired
};

export default EditRateModal; 