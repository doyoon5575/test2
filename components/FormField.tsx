
import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    {children}
    {required && <span className="ml-1 text-blue-600 font-bold">*</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-800"
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-800 appearance-none"
  >
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-800 min-h-[100px] resize-y"
  />
);

interface ChipProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  type?: 'checkbox' | 'radio';
}

export const Chip: React.FC<ChipProps> = ({ label, checked, onChange, type = 'checkbox' }) => (
  <label className={`
    inline-flex items-center px-4 py-2 rounded-full border cursor-pointer transition-all select-none
    ${checked 
      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}
  `}>
    <input
      type={type}
      className="hidden"
      checked={checked}
      onChange={onChange}
    />
    <span className="text-sm">{label}</span>
  </label>
);