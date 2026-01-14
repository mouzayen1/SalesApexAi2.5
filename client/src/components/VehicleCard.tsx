import { Link } from 'react-router-dom';
import { Car, Fuel, Gauge, Settings } from 'lucide-react';
import type { Vehicle } from '@salesapexai/shared';
import { formatCurrency, formatMileage, cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  estimatedPayment?: number;
}

export default function VehicleCard({ vehicle, estimatedPayment }: VehicleCardProps) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="card overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="aspect-[16/10] relative bg-gray-100 overflow-hidden">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {estimatedPayment && estimatedPayment > 0 && (
          <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Est. {formatCurrency(estimatedPayment)}/mo
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.trim && (
              <p className="text-sm text-gray-500">{vehicle.trim}</p>
            )}
          </div>
          <p className="text-lg font-bold text-primary-600 whitespace-nowrap">
            {formatCurrency(vehicle.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span>{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-gray-400" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-gray-400" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-gray-400" />
            <span>{vehicle.drivetrain}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            'bg-gray-100 text-gray-700'
          )}>
            {vehicle.bodyStyle}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            'bg-gray-100 text-gray-700'
          )}>
            {vehicle.color}
          </span>
          {vehicle.mpgCity && vehicle.mpgHighway && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              'bg-green-100 text-green-700'
            )}>
              {vehicle.mpgCity}/{vehicle.mpgHighway} MPG
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
