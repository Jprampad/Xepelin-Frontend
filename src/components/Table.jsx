import React, { useEffect, useState, useCallback } from 'react';
import { ratesService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import AddRateModal from './AddRateModal';
import EditRateModal from './EditRateModal';
import { TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function Table() {
  const [rates, setRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [editingRate, setEditingRate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      const data = await ratesService.getRates(); // Cambiar getRates por ratesService.getRates
      setRates(data);
      setFilteredRates(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err.response?.data?.detail || 'Error al cargar los datos');
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = rates.filter(rate => 
        String(rate.idOp).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRates(filtered);
    } else {
      setFilteredRates(rates);
    }
  }, [searchTerm, rates]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setIsEditModalOpen(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  };

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredRates].sort((a, b) => {
      if (key === 'idOp') {
        // Ordenar IDs como números
        return direction === 'ascending' 
          ? parseInt(a[key]) - parseInt(b[key])
          : parseInt(b[key]) - parseInt(a[key]);
      }
      if (key === 'tasa') {
        // Ordenar tasas como números decimales
        return direction === 'ascending'
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      }
      return 0;
    });

    setFilteredRates(sortedData);
  };

  const handleDelete = async (idOp) => {
    setIsDeleting(true);
    try {
      await ratesService.deleteRate(idOp);
      
      // Actualizar el estado local después de eliminar
      setRates(prevRates => prevRates.filter(rate => rate.idOp !== idOp));
      setFilteredRates(prevRates => prevRates.filter(rate => rate.idOp !== idOp));
      
      toast.success('Tasa eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.detail || 'Error al eliminar la tasa');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setIdToDelete(null);
    }
  };

  if (loading) return <Loading />;
  if (error) {
    if (error === "No se encontraron tasas") {
      return (
        <div className="min-h-screen bg-[#F8FAFC] py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-full flex flex-col items-center mb-6">
                <img 
                  src="/xepelin-logo.png" 
                  alt="Xepelin Logo" 
                  className="h-8 sm:h-12 mb-4"
                />
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Gestión de Tasas</h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-500">Administra las tasas de operación</p>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-[300px]">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-4 py-2 sm:py-3 pl-10 text-sm border border-gray-200 rounded-xl"
                      placeholder="Buscar por ID de operación..."
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Solo permitir números
                        if (value === '' || /^[0-9]+$/.test(value)) {
                          setSearchTerm(value);
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar Nuevo Registro</span>
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg 
                          className="w-12 h-12 mb-4 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        <p className="text-lg font-medium">No se encontraron registros</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Agrega un nuevo registro usando el botón "Agregar Nuevo Registro"
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AddRateModal 
              isOpen={isAddModalOpen}
              onClose={() => {
                setIsAddModalOpen(false);
                setError(null);
              }}
              onSuccess={() => {
                fetchRates();
                setIsAddModalOpen(false);
                showAlert('Registro agregado exitosamente', 'success');
              }}
              showAlert={showAlert}
            />

            {alert.show && (
              <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg transition-all duration-500 z-50 flex items-center gap-2 ${
                alert.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : alert.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-400 text-black'
              }`}>
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Error
            </div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-full flex flex-col items-center mb-6">
          <img 
            src="/xepelin-logo.png" 
            alt="Xepelin Logo" 
            className="h-8 sm:h-12 mb-4"
          />
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Gestión de Tasas</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">Administra las tasas de operación</p>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-[300px]">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-2 sm:py-3 pl-10 text-sm border border-gray-200 rounded-xl"
                placeholder="Buscar por ID de operación..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permitir números
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setSearchTerm(value);
                  }
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Nuevo Registro</span>
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {rates.length > 0 ? (
                <>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 group"
                          onClick={() => sortData('idOp')}
                        >
                          <div className="flex items-center gap-2">
                            ID Operación
                            <span className={`transition-colors ${
                              sortConfig.key === 'idOp' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                            }`}>
                              {getSortIcon('idOp')}
                            </span>
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 group"
                          onClick={() => sortData('tasa')}
                        >
                          <div className="flex items-center gap-2">
                            Tasa
                            <span className={`transition-colors ${
                              sortConfig.key === 'tasa' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                            }`}>
                              {getSortIcon('tasa')}
                            </span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredRates.length > 0 ? (
                        filteredRates.map((rate) => (
                          <tr key={rate.idOp} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rate.idOp}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {rate.tasa.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rate.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(rate)}
                                  className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md"
                                >
                                  <svg 
                                    className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth="2" 
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setIdToDelete(rate.idOp);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                                >
                                  <TrashIcon className="h-4 w-4 mr-1" />
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No se encontraron resultados para la búsqueda "{searchTerm}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No se encontraron registros
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Agrega un nuevo registro usando el botón "Agregar Nuevo Registro"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddRateModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRate(null);
        }}
        onSuccess={fetchRates}
        showAlert={showAlert}
        editingRate={editingRate}
      />

      <EditRateModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRate(null);
        }}
        rate={editingRate}
        onSuccess={fetchRates}
        showAlert={showAlert}
      />

      {alert.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg transition-all duration-500 z-50 flex items-center gap-2 ${
          alert.type === 'success' 
            ? 'bg-green-500 text-white' 
            : alert.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-amber-400 text-black'
        }`}>
          {alert.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {alert.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {alert.type === 'info' && (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.5c-5.8 0-10.5 4.7-10.5 10.5S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM12 4c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1s-1-.4-1-1V5c0-.6.4-1 1-1zm0 12c-.8 0-1.5-.7-1.5-1.5S11.2 13 12 13s1.5.7 1.5 1.5S12.8 16 12 16z"/>
            </svg>
          )}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Estás seguro de eliminar esta tasa?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIdToDelete(null);
                }}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(idToDelete)}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md 
                  flex items-center justify-center min-w-[80px]
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
              >
                {isDeleting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;