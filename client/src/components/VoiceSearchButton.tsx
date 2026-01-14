import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceSearchButton({
  isListening,
  isSupported,
  transcript,
  error,
  onStart,
  onStop,
}: VoiceSearchButtonProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MicOff className="w-4 h-4" />
        <span>Voice search not supported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={isListening ? onStop : onStart}
        className={cn(
          'relative p-4 rounded-full transition-all',
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        )}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {isListening && (
          <span className="absolute -inset-1 rounded-full border-2 border-red-400 animate-ping" />
        )}
      </button>

      {isListening && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Listening...</p>
          {transcript && (
            <p className="text-sm text-gray-600 mt-1 max-w-xs">"{transcript}"</p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!isListening && !error && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Try: "Show me Toyota SUVs under $30,000" or "2020 or newer with AWD"
        </p>
      )}
    </div>
  );
}
