import { useState, useRef, useEffect } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface HelpTooltipProps {
  helpKey: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ helpKey, className = '', iconSize = 'sm', position = 'top' }: HelpTooltipProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const helpText = t(`help.${helpKey}`);
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 320; // w-80
      const tooltipHeight = 120; // approximate height
      const padding = 8;
      
      let top = 0;
      let left = 0;
      
      if (position === 'top') {
        top = rect.top - tooltipHeight - padding;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      } else if (position === 'bottom') {
        top = rect.bottom + padding;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      } else if (position === 'left') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - padding;
      } else if (position === 'right') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + padding;
      }
      
      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position
      if (left < padding) {
        left = padding;
      } else if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
      
      // Adjust vertical position
      if (top < padding) {
        top = rect.bottom + padding; // Switch to bottom
      } else if (top + tooltipHeight > viewportHeight - padding) {
        top = rect.top - tooltipHeight - padding; // Switch to top
      }
      
      // Apply RTL adjustments
      if (isRTL) {
        // Mirror horizontal positions for RTL
        if (position === 'left') {
          left = rect.right + padding;
        } else if (position === 'right') {
          left = rect.left - tooltipWidth - padding;
        }
      }
      
      setCoords({ top, left });
    }
  }, [isOpen, position, isRTL]);
  
  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-gray-400 hover:text-gray-300 transition-colors"
      >
        <QuestionMarkCircleIcon className={sizeClasses[iconSize]} />
      </button>
      
      {isOpen && coords && createPortal(
        <div 
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          className="w-64 sm:w-80"
        >
          <div className="relative bg-gray-900 text-white text-sm rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="font-semibold mb-2 text-primary-400">
              {t(`help.${helpKey}_title`)}
            </div>
            <div className="text-gray-200 leading-relaxed whitespace-normal">
              {helpText}
            </div>
            {/* Arrow */}
            <div className={`
              absolute w-0 h-0 border-4 border-transparent
              ${
                position === 'top'
                  ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900'
                  : position === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-900'
                  : position === 'left'
                  ? `${isRTL ? 'right-full' : 'left-full'} top-1/2 -translate-y-1/2 ${isRTL ? '-mr-1' : '-ml-1'} ${isRTL ? 'border-r-gray-900' : 'border-l-gray-900'}`
                  : position === 'right'
                  ? `${isRTL ? 'left-full' : 'right-full'} top-1/2 -translate-y-1/2 ${isRTL ? '-ml-1' : '-mr-1'} ${isRTL ? 'border-l-gray-900' : 'border-r-gray-900'}`
                  : ''
              }
            `}></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}