import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

const AccessibilityToggle: React.FC = () => {
  const { isEasyMode, toggleEasyMode, isHighContrast, toggleHighContrast } = useAccessibility();

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 sm:p-1.5 rounded-2xl border border-gray-200 shrink-0">
      <button
        type="button"
        onClick={toggleEasyMode}
        className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
          isEasyMode
            ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-500 scale-105'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        title={isEasyMode ? 'Easy Mode Active (Click to switch to Standard UI)' : 'Toggle Easy Mode with larger text & simple buttons'}
        aria-pressed={isEasyMode}
        aria-label="Toggle Easy Mode"
      >
        <Sparkles className="w-4 h-4 text-amber-900 shrink-0" />
        <span className="hidden sm:inline">{isEasyMode ? 'EASY MODE ON' : 'Easy Mode'}</span>
        <span className="sm:hidden text-[10px]">{isEasyMode ? 'EASY' : 'EASY'}</span>
      </button>

      <button
        type="button"
        onClick={toggleHighContrast}
        className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
          isHighContrast ? 'bg-black text-yellow-300 ring-2 ring-yellow-400' : 'text-gray-600 hover:bg-gray-200'
        }`}
        title="Toggle High Contrast Mode"
        aria-pressed={isHighContrast}
        aria-label="Toggle High Contrast Mode"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AccessibilityToggle;
