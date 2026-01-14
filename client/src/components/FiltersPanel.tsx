import { useState, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Filters, SortOption } from '@salesapexai/shared';
import { cn, formatCurrency } from '@/lib/utils';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableMakes?: string[];
}

const BODY_STYLES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Wagon', 'Van', 'Convertible'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const COLORS = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Yellow', 'Orange'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Newest First' },
  { value: 'miles_asc', label: 'Lowest Mileage' },
];

const PRICE_RANGES = [
  { label: 'Under $15,000', max: 15000 },
  { label: '$15,000 - $25,000', min: 15000, max: 25000 },
  { label: '$25,000 - $35,000', min: 25000, max: 35000 },
  { label: '$35,000 - $50,000', min: 35000, max: 50000 },
  { label: 'Over $50,000', min: 50000 },
];

const YEAR_RANGES = [
  { label: '2023+', min: 2023 },
  { label: '2020-2022', min: 2020, max: 2022 },
  { label: '2017-2019', min: 2017, max: 2019 },
  { label: '2014-2016', min: 2014, max: 2016 },
  { label: 'Older', max: 2013 },
];

const MILEAGE_RANGES = [
  { label: 'Under 25,000', max: 25000 },
  { label: '25,000 - 50,000', max: 50000 },
  { label: '50,000 - 75,000', max: 75000 },
  { label: '75,000 - 100,000', max: 100000 },
  { label: 'Over 100,000', min: 100000 },
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-900"
      >
        {title}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, option]);
              } else {
                onChange(selected.filter((s) => s !== option));
              }
            }}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">{option}</span>
        </label>
      ))}
    </div>
  );
}

export default function FiltersPanel({ filters, onFiltersChange, availableMakes = [] }: FiltersPanelProps) {
  const makes = useMemo(() => {
    const defaultMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia',
      'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Mazda', 'Subaru', 'Volkswagen',
      'Jeep', 'Dodge', 'GMC', 'Tesla',
    ];
    return [...new Set([...defaultMakes, ...availableMakes])].sort();
  }, [availableMakes]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.maxPrice || filters.minPrice) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.maxMiles) count++;
    if (filters.make?.length) count++;
    if (filters.bodyStyle?.length) count++;
    if (filters.drivetrain?.length) count++;
    if (filters.fuel?.length) count++;
    if (filters.transmission?.length) count++;
    if (filters.color?.length) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="label">Sort By</label>
        <select
          value={filters.sort || ''}
          onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as SortOption || undefined })}
          className="select"
        >
          <option value="">Default</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <FilterSection title="Price" defaultOpen>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onChange={() => onFiltersChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
          />
        </div>
      </FilterSection>

      {/* Make */}
      <FilterSection title="Make" defaultOpen>
        <CheckboxGroup
          options={makes}
          selected={filters.make || []}
          onChange={(make) => onFiltersChange({ ...filters, make })}
        />
      </FilterSection>

      {/* Year */}
      <FilterSection title="Year">
        <div className="space-y-2">
          {YEAR_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="year"
                checked={filters.minYear === range.min && filters.maxYear === range.max}
                onChange={() => onFiltersChange({ ...filters, minYear: range.min, maxYear: range.max })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="From"
            value={filters.minYear || ''}
            onChange={(e) => onFiltersChange({ ...filters, minYear: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
          />
          <input
            type="number"
            placeholder="To"
            value={filters.maxYear || ''}
            onChange={(e) => onFiltersChange({ ...filters, maxYear: e.target.value ? Number(e.target.value) : undefined })}
            className="input"
          />
        </div>
      </FilterSection>

      {/* Mileage */}
      <FilterSection title="Mileage">
        <div className="space-y-2">
          {MILEAGE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mileage"
                checked={filters.maxMiles === range.max && filters.minMiles === range.min}
                onChange={() => onFiltersChange({ ...filters, minMiles: range.min, maxMiles: range.max })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Body Style */}
      <FilterSection title="Body Style">
        <CheckboxGroup
          options={BODY_STYLES}
          selected={filters.bodyStyle || []}
          onChange={(bodyStyle) => onFiltersChange({ ...filters, bodyStyle })}
        />
      </FilterSection>

      {/* Drivetrain */}
      <FilterSection title="Drivetrain">
        <CheckboxGroup
          options={DRIVETRAINS}
          selected={filters.drivetrain || []}
          onChange={(drivetrain) => onFiltersChange({ ...filters, drivetrain })}
        />
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type">
        <CheckboxGroup
          options={FUEL_TYPES}
          selected={filters.fuel || []}
          onChange={(fuel) => onFiltersChange({ ...filters, fuel })}
        />
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        <CheckboxGroup
          options={TRANSMISSIONS}
          selected={filters.transmission || []}
          onChange={(transmission) => onFiltersChange({ ...filters, transmission })}
        />
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <CheckboxGroup
          options={COLORS}
          selected={filters.color || []}
          onChange={(color) => onFiltersChange({ ...filters, color })}
        />
      </FilterSection>
    </div>
  );
}
