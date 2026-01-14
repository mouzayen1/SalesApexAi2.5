import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Car,
  Fuel,
  Gauge,
  Settings,
  Calendar,
  MapPin,
  Check,
  Calculator,
  Loader2,
} from 'lucide-react';
import { calculateSimplePayment } from '@salesapexai/shared';
import { getVehicle } from '@/lib/api';
import { formatCurrency, formatMileage, cn } from '@/lib/utils';

const TERM_OPTIONS = [36, 48, 60, 72, 84];

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [downPayment, setDownPayment] = useState(3000);
  const [apr, setApr] = useState(7);
  const [term, setTerm] = useState(60);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const estimatedPayment = calculateSimplePayment(vehicle.price, downPayment, apr, term);

  const handleOpenRehash = () => {
    // Navigate to rehash with vehicle pre-filled
    const params = new URLSearchParams({
      vehicleId: vehicle.id,
      year: vehicle.year.toString(),
      make: vehicle.make,
      model: vehicle.model,
      mileage: vehicle.mileage.toString(),
      price: vehicle.price.toString(),
    });
    navigate(`/rehash-optimizer?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inventory
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {vehicle.imageUrl ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            {vehicle.trim && (
              <p className="text-lg text-gray-600">{vehicle.trim}</p>
            )}
            <p className="text-4xl font-bold text-primary-600 mt-4">
              {formatCurrency(vehicle.price)}
            </p>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Gauge className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Mileage</p>
                <p className="font-medium">{formatMileage(vehicle.mileage)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Fuel className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Fuel</p>
                <p className="font-medium">{vehicle.fuelType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Transmission</p>
                <p className="font-medium">{vehicle.transmission}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Car className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Drivetrain</p>
                <p className="font-medium">{vehicle.drivetrain}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {vehicle.bodyStyle}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {vehicle.color}
            </span>
            {vehicle.seats && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {vehicle.seats} Seats
              </span>
            )}
            {vehicle.mpgCity && vehicle.mpgHighway && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {vehicle.mpgCity}/{vehicle.mpgHighway} MPG
              </span>
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{vehicle.description}</p>
            </div>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {vehicle.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleOpenRehash}
            className="w-full btn btn-primary py-3 text-lg"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Open Deal Optimizer
          </button>
        </div>
      </div>

      {/* Payment Calculator Card */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Estimator</h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="label">Down Payment</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="input pl-7"
                min={0}
                step={500}
              />
            </div>
          </div>

          <div>
            <label className="label">APR (%)</label>
            <input
              type="number"
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="input"
              min={0}
              max={30}
              step={0.5}
            />
          </div>

          <div>
            <label className="label">Loan Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="select"
            >
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>{t} months</option>
              ))}
            </select>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 flex flex-col justify-center">
            <p className="text-sm text-primary-700 mb-1">Estimated Payment</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(estimatedPayment)}
              <span className="text-sm font-normal text-primary-500">/mo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
