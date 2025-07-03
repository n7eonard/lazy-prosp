import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
];

interface CountrySelectorProps {
  selectedCountry: string | null;
  onCountrySelect: (countryCode: string) => void;
}

export const CountrySelector = ({ selectedCountry, onCountrySelect }: CountrySelectorProps) => {
  return (
    <div className="text-center mb-8">
      <h3 className="text-lg font-semibold mb-4">Select your target market</h3>
      
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
        {countries.map((country) => (
          <Button
            key={country.code}
            variant={selectedCountry === country.code ? "default" : "outline"}
            className="h-auto flex flex-col items-center gap-2 p-4 relative"
            onClick={() => onCountrySelect(country.code)}
          >
            <span className="text-2xl">{country.flag}</span>
            <span className="text-xs font-medium">{country.name}</span>
            {selectedCountry === country.code && (
              <Check className="w-4 h-4 absolute -top-1 -right-1 text-primary-foreground bg-primary rounded-full p-0.5" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};