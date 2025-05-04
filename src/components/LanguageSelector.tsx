import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe2 } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe2 className="w-5 h-5 text-gray-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
        className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 cursor-pointer"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}