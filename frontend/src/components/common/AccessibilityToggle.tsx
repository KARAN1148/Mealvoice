import React from 'react';
import { Eye, Sun, Sparkles } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

const AccessibilityToggle: React.FC = () => {
  const { isEasyMode, toggleEasyMode, isHighContrast, toggleHighContrast } = useAccessibility();

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
      <button
        onClick={toggleEasyMode}
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
          isEasyMode
            ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-500 scale-105'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        title="Toggle Easy Mode with larger text & simple buttons"
        aria-pressed={isEasyMode}
      >
        <Sparkles className="w-4 h-4 text-amber-900" />
        <span>{isEasyMode ? 'EASY MODE ON' : 'Easy Mode'}</span>
      </button>

      <button
        onClick={toggleHighContrast}
        className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
          isHighContrast ? 'bg-black text-yellow-300 ring-2 ring-yellow-400' : 'text-gray-600 hover:bg-gray-200'
        }`}
        title="Toggle High Contrast Mode"
        aria-pressed={isHighContrast}
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AccessibilityToggle;
