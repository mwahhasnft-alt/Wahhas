import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Apple Frosted Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Apple Dialog Sheet */}
      <div className="bg-white dark:bg-[#161618] text-neutral-900 dark:text-neutral-100 w-full max-w-2xl rounded-2xl sm:rounded-[28px] shadow-2xl border border-black/[0.08] dark:border-white/[0.12] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] relative z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-black/[0.05] dark:border-white/[0.06] bg-white/70 dark:bg-[#161618]/70 backdrop-blur-xl shrink-0">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white truncate pr-2 rtl:pr-0 rtl:pl-2">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-3.5 sm:p-6 flex-1 bg-[#FBFBFD] dark:bg-[#111113] scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;