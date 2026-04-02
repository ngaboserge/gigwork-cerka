import { useState, useRef, useEffect, ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[200px] bg-white border border-neutral-200 shadow-industrial-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onClick, icon, danger = false, disabled = false }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors ${
        disabled
          ? 'text-neutral-400 cursor-not-allowed'
          : danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <hr className="border-neutral-100 my-1" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
      {children}
    </div>
  );
}
