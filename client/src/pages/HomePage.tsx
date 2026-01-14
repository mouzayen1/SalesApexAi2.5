import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Car, Filter, X } from 'lucide-react';
import type { Filters } from '@salesapexai/shared';
import { calculateSimplePayment } from '@salesapexai/shared';
import { getVehicles } from '@/lib/api';
import { cn } from '@/lib/utils';
import VehicleCard from '@/components/VehicleCard';
import FiltersPanel from '@/components/FiltersPanel';
import PaymentCalculator from '@/components/PaymentCalculator';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [calculatorValues, setCalculatorValues] = useState<{
    downPayment: number;
    apr: number;
    term: number;
  } | null>(null);

  const handleFiltersFromVoice = (voiceFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...voiceFilters }));
    if (voiceFilters.search) {
      setSearchQuery(voiceFilters.search);
    }
  };

  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceSearch(handleFiltersFromVoice);

  const activeFilters = useMemo(() => {
    const active: Filters = { ...filters };
    if (searchQuery.trim()) {
      active.search = searchQuery.trim();
    }
    return active;
  }, [filters, searchQuery]);

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles', activeFilters],
    queryFn: () => getVehicles(activeFilters),
  });

  const vehiclesWithPayments = useMemo(() => {
    if (!calculatorValues) return vehicles.map(v => ({ vehicle: v, payment: undefined }));

    return vehicles.map(vehicle => ({
      vehicle,
      payment: calculateSimplePayment(
        vehicle.price,
        calculatorValues.downPayment,
        calculatorValues.apr,
        calculatorValues.term
      ),
    }));
  }, [vehicles, calculatorValues]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive through activeFilters
  };

  const availableMakes = useMemo(() => {
    return [...new Set(vehicles.map(v => v.make))];
  }, [vehicles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Inventory</h1>
        <p className="text-gray-600">Browse our selection of quality pre-owned vehicles</p>
      </div>

      {/* Search and Voice */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Search Form */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by make, model, or keyword..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-lg"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Voice Search */}
          <div className="flex-shrink-0">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              transcript={transcript}
              error={voiceError}
              onStart={startListening}
              onStop={stopListening}
            />
          </div>
        </div>
      </div>

      {/* Payment Calculator */}
      <div className="mb-6">
        <PaymentCalculator onCalculatorChange={setCalculatorValues} />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={cn(
          'w-72 flex-shrink-0 transition-all',
          showFilters ? 'block' : 'hidden lg:block'
        )}>
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableMakes={availableMakes}
          />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <p className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${vehicles.length} vehicles found`}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading vehicles...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">Failed to load vehicles. Please try again.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && vehicles.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
                className="btn btn-primary"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Vehicle Grid */}
          {!isLoading && !error && vehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehiclesWithPayments.map(({ vehicle, payment }) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  estimatedPayment={payment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
