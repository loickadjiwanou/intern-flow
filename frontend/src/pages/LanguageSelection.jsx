import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ChevronRight } from 'lucide-react';

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-brand-600 via-brand-500 to-blue-600 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Globe className="w-20 h-20 mx-auto text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-heading font-bold text-white mb-4">InternFlow</h1>
          <p className="text-xl text-blue-50">Select your language / Sélectionnez votre langue</p>
        </div>

        {/* Language Cards */}
        <div className="space-y-4">
          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white"
            onClick={() => handleLanguageSelect('fr')}
            data-testid="language-select-fr"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🇫🇷</div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold mb-1">Français</h3>
                    <p className="text-sm text-muted-foreground">French / France</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-brand-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white"
            onClick={() => handleLanguageSelect('en')}
            data-testid="language-select-en"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🇬🇧</div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold mb-1">English</h3>
                    <p className="text-sm text-muted-foreground">English / United Kingdom</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-brand-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-blue-100 mt-8">
          You can change the language anytime in settings<br />
          Vous pouvez changer la langue à tout moment dans les paramètres
        </p>
      </div>
    </div>
  );
}
