import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateSimplePayment } from '@salesapexai/shared';
import { formatCurrency, cn } from '@/lib/utils';

interface PaymentCalculatorProps {
  onCalculatorChange?: (values: { downPayment: number; apr: number; term: number } | null) => void;
}

const TERM_OPTIONS = [36, 48, 60, 72, 84];

export default function PaymentCalculator({ onCalculatorChange }: PaymentCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [downPayment, setDownPayment] = useState(3000);
  const [apr, setApr] = useState(7);
  const [term, setTerm] = useState(60);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    if (onCalculatorChange) {
      onCalculatorChange(newEnabled ? { downPayment, apr, term } : null);
    }
  };

  const handleChange = (field: 'downPayment' | 'apr' | 'term', value: number) => {
    if (field === 'downPayment') setDownPayment(value);
    if (field === 'apr') setApr(value);
    if (field === 'term') setTerm(value);

    if (isEnabled && onCalculatorChange) {
      onCalculatorChange({
        downPayment: field === 'downPayment' ? value : downPayment,
        apr: field === 'apr' ? value : apr,
        term: field === 'term' ? value : term,
      });
    }
  };

  // Example payment for $25,000 vehicle
  const examplePayment = calculateSimplePayment(25000, downPayment, apr, term);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isEnabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
          )}>
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Payment Calculator</h3>
            <p className="text-sm text-gray-500">
              {isEnabled
                ? `${formatCurrency(downPayment)} down, ${apr}% APR, ${term} months`
                : 'Estimate monthly payments'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Show estimated payments</span>
            <button
              onClick={handleToggle}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                isEnabled ? 'bg-primary-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Down Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => handleChange('downPayment', Number(e.target.value))}
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
                onChange={(e) => handleChange('apr', Number(e.target.value))}
                className="input"
                min={0}
                max={30}
                step={0.5}
              />
              <input
                type="range"
                value={apr}
                onChange={(e) => handleChange('apr', Number(e.target.value))}
                className="w-full mt-2"
                min={0}
                max={30}
                step={0.5}
              />
            </div>

            <div>
              <label className="label">Loan Term</label>
              <div className="grid grid-cols-5 gap-2">
                {TERM_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange('term', t)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium transition-colors',
                      term === t
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {t}mo
                  </button>
                ))}
              </div>
            </div>

            {isEnabled && (
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                <p className="text-sm text-gray-600 mb-1">Example payment for $25,000 vehicle:</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(examplePayment)}<span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
