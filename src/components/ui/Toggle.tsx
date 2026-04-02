interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, description, disabled = false, size = 'md' }: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  };

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex flex-shrink-0 ${sizes[size].track} border-2 border-transparent rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-800' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${sizes[size].thumb} rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
            checked ? sizes[size].translate : 'translate-x-0'
          }`}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="text-sm font-medium text-neutral-900">{label}</span>}
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
