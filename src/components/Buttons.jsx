import React from 'react';

export const PrimaryButton = ({ children, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const IconButton = ({ icon: Icon, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    {...props}
  >
    <Icon className="w-5 h-5 text-gray-600" />
  </button>
); 