import React from 'react';

interface LogoProps {
  className?: string;
  lang?: 'en' | 'ar';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  lang = 'en', 
  size = 'md' 
}) => {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl"
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none font-sans ${className}`} dir="ltr">
      {/* Apple Minimalist Architectural Glyphs */}
      <div className={`relative flex items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%]">
          {/* Minimalist architectural arch & sanctuary pillar */}
          <path d="M4 20V10a8 8 0 0 1 16 0v10" />
          <path d="M12 12v8" />
        </svg>
      </div>

      <div className="flex items-baseline tracking-[-0.03em]">
        <span className={`font-semibold text-neutral-900 dark:text-neutral-50 ${textSizes[size]}`}>
          Aqar
        </span>
        <span className={`font-normal text-neutral-400 dark:text-neutral-500 ml-1 ${textSizes[size]}`}>
          AI
        </span>
      </div>
    </div>
  );
};

export default Logo;
