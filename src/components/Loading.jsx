import React from 'react';

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-[#1E293B] font-medium">Cargando...</p>
      </div>
    </div>
  );
}

export default Loading;
