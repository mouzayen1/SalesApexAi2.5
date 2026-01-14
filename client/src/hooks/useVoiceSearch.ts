import { useState, useCallback, useRef, useEffect } from 'react';
import type { Filters } from '@salesapexai/shared';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Synonym mappings
const MAKE_SYNONYMS: Record<string, string> = {
  chevy: 'chevrolet',
  vw: 'volkswagen',
  merc: 'mercedes-benz',
  benz: 'mercedes-benz',
  'mercedes benz': 'mercedes-benz',
  beamer: 'bmw',
  beemer: 'bmw',
  'land rover': 'land rover',
  landrover: 'land rover',
  'alfa romeo': 'alfa romeo',
  alfa: 'alfa romeo',
};

const BODY_STYLE_SYNONYMS: Record<string, string> = {
  car: 'sedan',
  coupe: 'coupe',
  coup: 'coupe',
  suv: 'suv',
  crossover: 'suv',
  truck: 'truck',
  pickup: 'truck',
  'pick up': 'truck',
  van: 'van',
  minivan: 'van',
  'mini van': 'van',
  wagon: 'wagon',
  'station wagon': 'wagon',
  hatchback: 'hatchback',
  hatch: 'hatchback',
  convertible: 'convertible',
};

const DRIVETRAIN_SYNONYMS: Record<string, string> = {
  awd: 'awd',
  'all wheel': 'awd',
  'all wheel drive': 'awd',
  '4wd': '4wd',
  'four wheel': '4wd',
  'four wheel drive': '4wd',
  '4x4': '4wd',
  fwd: 'fwd',
  'front wheel': 'fwd',
  'front wheel drive': 'fwd',
  rwd: 'rwd',
  'rear wheel': 'rwd',
  'rear wheel drive': 'rwd',
};

const FUEL_SYNONYMS: Record<string, string> = {
  gas: 'gasoline',
  gasoline: 'gasoline',
  petrol: 'gasoline',
  diesel: 'diesel',
  electric: 'electric',
  ev: 'electric',
  hybrid: 'hybrid',
  'plug in': 'hybrid',
  phev: 'hybrid',
};

const FEATURE_KEYWORDS: Record<string, string[]> = {
  'leather': ['leather', 'leather seats'],
  'sunroof': ['sunroof', 'panoramic', 'moonroof'],
  'navigation': ['navigation', 'nav', 'gps'],
  'bluetooth': ['bluetooth'],
  'backup camera': ['backup camera', 'rear camera', 'reverse camera'],
  'heated seats': ['heated seats', 'heated'],
  'apple carplay': ['carplay', 'apple carplay'],
  'android auto': ['android auto'],
  'blind spot': ['blind spot', 'blind spot monitor'],
  'lane departure': ['lane departure', 'lane assist', 'lane keep'],
  'adaptive cruise': ['adaptive cruise', 'smart cruise'],
};

const COLOR_KEYWORDS = [
  'white', 'black', 'silver', 'gray', 'grey', 'red', 'blue', 'green',
  'brown', 'tan', 'beige', 'gold', 'yellow', 'orange', 'purple', 'maroon',
];

export function useVoiceSearch(onFiltersChange: (filters: Partial<Filters>) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);

    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const parseTranscript = useCallback((text: string): Partial<Filters> => {
    const filters: Partial<Filters> = {};
    const lowerText = text.toLowerCase();

    // Price patterns
    const underPriceMatch = lowerText.match(/(?:under|below|less than|max|maximum)\s*\$?\s*(\d{1,3}(?:,?\d{3})*)/);
    if (underPriceMatch) {
      filters.maxPrice = parseInt(underPriceMatch[1].replace(/,/g, ''));
    }

    const overPriceMatch = lowerText.match(/(?:over|above|more than|min|minimum|at least)\s*\$?\s*(\d{1,3}(?:,?\d{3})*)/);
    if (overPriceMatch) {
      filters.minPrice = parseInt(overPriceMatch[1].replace(/,/g, ''));
    }

    const betweenPriceMatch = lowerText.match(/(?:between)\s*\$?\s*(\d{1,3}(?:,?\d{3})*)\s*(?:and|to|-)\s*\$?\s*(\d{1,3}(?:,?\d{3})*)/);
    if (betweenPriceMatch) {
      filters.minPrice = parseInt(betweenPriceMatch[1].replace(/,/g, ''));
      filters.maxPrice = parseInt(betweenPriceMatch[2].replace(/,/g, ''));
    }

    // Year patterns
    const yearMatch = lowerText.match(/\b(20\d{2}|19\d{2})\b/g);
    if (yearMatch) {
      const years = yearMatch.map(y => parseInt(y)).sort((a, b) => a - b);
      if (lowerText.includes('newer') || lowerText.includes('after') || lowerText.includes('or newer')) {
        filters.minYear = years[0];
      } else if (lowerText.includes('older') || lowerText.includes('before') || lowerText.includes('or older')) {
        filters.maxYear = years[0];
      } else if (years.length >= 2) {
        filters.minYear = years[0];
        filters.maxYear = years[years.length - 1];
      } else {
        filters.minYear = years[0];
        filters.maxYear = years[0];
      }
    }

    // Mileage patterns
    const underMilesMatch = lowerText.match(/(?:under|below|less than)\s*(\d{1,3}(?:,?\d{3})*)\s*(?:miles?|mi)?/);
    if (underMilesMatch) {
      filters.maxMiles = parseInt(underMilesMatch[1].replace(/,/g, ''));
    }

    const lowMileageMatch = lowerText.match(/low\s*mileage/);
    if (lowMileageMatch) {
      filters.maxMiles = 50000;
    }

    // Makes
    const words = lowerText.split(/\s+/);
    const makes: string[] = [];
    const knownMakes = [
      'toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'hyundai', 'kia', 'bmw',
      'mercedes', 'audi', 'volkswagen', 'lexus', 'mazda', 'subaru', 'dodge', 'jeep',
      'ram', 'gmc', 'buick', 'cadillac', 'lincoln', 'infiniti', 'acura', 'volvo',
      'jaguar', 'porsche', 'tesla', 'mini', 'fiat', 'chrysler',
    ];

    for (const word of words) {
      const normalized = MAKE_SYNONYMS[word] || word;
      if (knownMakes.includes(normalized) || knownMakes.some(m => m.includes(normalized))) {
        const match = knownMakes.find(m => m === normalized || m.includes(normalized));
        if (match && !makes.includes(match)) {
          makes.push(match);
        }
      }
    }
    if (makes.length > 0) {
      filters.make = makes;
    }

    // Body styles
    const bodyStyles: string[] = [];
    for (const [keyword, style] of Object.entries(BODY_STYLE_SYNONYMS)) {
      if (lowerText.includes(keyword) && !bodyStyles.includes(style)) {
        bodyStyles.push(style);
      }
    }
    if (bodyStyles.length > 0) {
      filters.bodyStyle = bodyStyles;
    }

    // Drivetrains
    const drivetrains: string[] = [];
    for (const [keyword, drive] of Object.entries(DRIVETRAIN_SYNONYMS)) {
      if (lowerText.includes(keyword) && !drivetrains.includes(drive)) {
        drivetrains.push(drive);
      }
    }
    if (drivetrains.length > 0) {
      filters.drivetrain = drivetrains;
    }

    // Fuel types
    const fuels: string[] = [];
    for (const [keyword, fuel] of Object.entries(FUEL_SYNONYMS)) {
      if (lowerText.includes(keyword) && !fuels.includes(fuel)) {
        fuels.push(fuel);
      }
    }
    if (fuels.length > 0) {
      filters.fuel = fuels;
    }

    // Colors
    const colors: string[] = [];
    for (const color of COLOR_KEYWORDS) {
      if (lowerText.includes(color)) {
        colors.push(color.charAt(0).toUpperCase() + color.slice(1));
      }
    }
    if (colors.length > 0) {
      filters.color = colors;
    }

    // Features
    const features: string[] = [];
    for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword) && !features.includes(feature)) {
          features.push(feature);
          break;
        }
      }
    }
    if (features.length > 0) {
      filters.features = features;
    }

    // Search text for model or general query
    // Remove parsed terms and use remaining as search
    let remainingText = lowerText;
    // Remove price terms
    remainingText = remainingText.replace(/(?:under|below|less than|max|maximum|over|above|more than|min|minimum|at least|between)\s*\$?\s*\d{1,3}(?:,?\d{3})*(?:\s*(?:and|to|-)\s*\$?\s*\d{1,3}(?:,?\d{3})*)?\s*/gi, '');
    // Remove year terms
    remainingText = remainingText.replace(/\b(20\d{2}|19\d{2})\b/g, '');
    // Remove mileage terms
    remainingText = remainingText.replace(/(?:under|below|less than)\s*\d{1,3}(?:,?\d{3})*\s*(?:miles?|mi)?/gi, '');
    // Remove common words
    remainingText = remainingText.replace(/\b(show|me|find|search|for|a|an|the|with|and|or|i\s*want|looking\s*for)\b/gi, '');
    // Trim
    remainingText = remainingText.trim().replace(/\s+/g, ' ');

    if (remainingText.length > 2) {
      filters.search = remainingText;
    }

    return filters;
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    setTranscript('');

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        const filters = parseTranscript(finalTranscript);
        onFiltersChange(filters);
      }
    };

    recognitionRef.current.onerror = (event: Event) => {
      const errorEvent = event as Event & { error?: string };
      setError(errorEvent.error || 'Speech recognition error');
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, [onFiltersChange, parseTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    parseTranscript,
  };
}
