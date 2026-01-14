import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Calculator,
  Loader2,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Percent,
  Clock,
  Building2,
  Shield,
  Car,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DealInput, DealCandidate, RehashResult, AnalyzeDealResponse, VSCTier } from '@salesapexai/shared';
import { runRehash, analyzeDeal } from '@/lib/api';
import { formatCurrency, formatCurrencyPrecise, formatPercent, cn } from '@/lib/utils';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' },
];

const DEFAULT_INPUT: DealInput = {
  vehicleYear: 2021,
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehicleMileage: 45000,
  vehicleRetailPrice: 22000,
  vehicleCost: 18000,
  state: 'CA',
  customerFico: 650,
  monthlyIncome: 5000,
  downPayment: 2000,
  tradeAllowance: 0,
  tradePayoff: 0,
  targetPayment: 450,
  paymentTolerance: 50,
  gapInsuranceSelected: false,
  vscSelected: false,
  vscTier: 'standard',
  dealerTier: 3,
};

interface DealCardProps {
  deal: DealCandidate;
  isBest: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function DealCard({ deal, isBest, isSelected, onSelect }: DealCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'card overflow-hidden cursor-pointer transition-all',
        isSelected && 'ring-2 ring-primary-500',
        isBest && 'ring-2 ring-green-500',
        !deal.approved && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{deal.lenderName}</h3>
              {isBest && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Best Deal
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{deal.programName}</p>
          </div>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            deal.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {deal.approved ? 'Approved' : 'Declined'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Monthly Payment</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(deal.monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">APR</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercent(deal.aprPercent)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-gray-500">Term</p>
            <p className="font-medium">{deal.term}mo</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-gray-500">LTV</p>
            <p className={cn('font-medium', deal.ltv > deal.ltvCap ? 'text-red-600' : '')}>
              {formatPercent(deal.ltv)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-gray-500">PTI</p>
            <p className={cn('font-medium', !deal.ptiValid ? 'text-red-600' : '')}>
              {formatPercent(deal.ptiPercent)}
            </p>
          </div>
        </div>

        {!deal.approved && deal.rejectionReasons.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700 font-medium mb-1">Rejection Reasons:</p>
            <ul className="text-xs text-red-600 space-y-0.5">
              {deal.rejectionReasons.map((reason, i) => (
                <li key={i}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
          className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          {showDetails ? 'Hide' : 'Show'} Details
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Dealer Profit */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Dealer Profit
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Front Gross:</span>
                  <span className="font-medium">{formatCurrency(deal.dealerFrontGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Backend:</span>
                  <span className="font-medium">{formatCurrency(deal.dealerBackendGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reserve:</span>
                  <span className="font-medium">{formatCurrency(deal.dealerReserve)}</span>
                </div>
                <div className="flex justify-between bg-green-50 p-1 rounded">
                  <span className="text-green-700 font-medium">Total:</span>
                  <span className="text-green-700 font-bold">{formatCurrency(deal.totalDealerProfit)}</span>
                </div>
              </div>
            </div>

            {/* Advance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Lender Advance
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross:</span>
                  <span className="font-medium">{formatCurrency(deal.advanceGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net:</span>
                  <span className="font-medium">{formatCurrency(deal.advanceNet)}</span>
                </div>
                <div className="flex justify-between col-span-2 bg-primary-50 p-1 rounded">
                  <span className="text-primary-700 font-medium">Net Check:</span>
                  <span className="text-primary-700 font-bold">{formatCurrency(deal.netCheckToDealer)}</span>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Financed:</span>
                  <span>{formatCurrency(deal.amountFinanced)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({formatPercent(deal.taxRate * 100)}):</span>
                  <span>{formatCurrency(deal.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Doc Fee:</span>
                  <span>{formatCurrency(deal.docFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration:</span>
                  <span>{formatCurrency(deal.registrationFee)}</span>
                </div>
                {deal.gapPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">GAP:</span>
                    <span>{formatCurrency(deal.gapPrice)}</span>
                  </div>
                )}
                {deal.vscPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">VSC:</span>
                    <span>{formatCurrency(deal.vscPrice)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RehashOptimizerPage() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState<DealInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<RehashResult | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AnalyzeDealResponse | null>(null);

  // Load vehicle from URL params
  useEffect(() => {
    const vehicleId = searchParams.get('vehicleId');
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const mileage = searchParams.get('mileage');
    const price = searchParams.get('price');

    if (vehicleId || year || make) {
      setInput(prev => ({
        ...prev,
        vehicleId: vehicleId || undefined,
        vehicleYear: year ? parseInt(year) : prev.vehicleYear,
        vehicleMake: make || prev.vehicleMake,
        vehicleModel: model || prev.vehicleModel,
        vehicleMileage: mileage ? parseInt(mileage) : prev.vehicleMileage,
        vehicleRetailPrice: price ? parseFloat(price) : prev.vehicleRetailPrice,
        vehicleCost: price ? Math.round(parseFloat(price) * 0.82) : prev.vehicleCost,
      }));
    }
  }, [searchParams]);

  const rehashMutation = useMutation({
    mutationFn: runRehash,
    onSuccess: (data) => {
      setResult(data);
      setSelectedDealId(data.bestDeal?.id || null);
      setAiAnalysis(null);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeDeal({
      dealInput: input,
      dealCandidates: result?.deals || [],
      selectedCandidateId: selectedDealId || undefined,
    }),
    onSuccess: (data) => {
      setAiAnalysis(data);
    },
  });

  const handleInputChange = (field: keyof DealInput, value: number | string | boolean) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    rehashMutation.mutate(input);
  };

  const selectedDeal = useMemo(() => {
    return result?.deals.find(d => d.id === selectedDealId);
  }, [result, selectedDealId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Optimizer</h1>
        <p className="text-gray-600">Structure and analyze auto finance deals across multiple lenders</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Deal Parameters
            </h2>

            <div className="space-y-4">
              {/* Vehicle Section */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Car className="w-4 h-4" /> Vehicle
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Year</label>
                    <input
                      type="number"
                      value={input.vehicleYear}
                      onChange={(e) => handleInputChange('vehicleYear', parseInt(e.target.value))}
                      className="input"
                      min={2000}
                      max={2026}
                    />
                  </div>
                  <div>
                    <label className="label">Make</label>
                    <input
                      type="text"
                      value={input.vehicleMake}
                      onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Model</label>
                    <input
                      type="text"
                      value={input.vehicleModel || ''}
                      onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Mileage</label>
                    <input
                      type="number"
                      value={input.vehicleMileage}
                      onChange={(e) => handleInputChange('vehicleMileage', parseInt(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <select
                      value={input.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="select"
                    >
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Retail Price</label>
                    <input
                      type="number"
                      value={input.vehicleRetailPrice}
                      onChange={(e) => handleInputChange('vehicleRetailPrice', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Cost</label>
                    <input
                      type="number"
                      value={input.vehicleCost}
                      onChange={(e) => handleInputChange('vehicleCost', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Section */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Customer</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">FICO Score</label>
                    <input
                      type="number"
                      value={input.customerFico}
                      onChange={(e) => handleInputChange('customerFico', parseInt(e.target.value))}
                      className="input"
                      min={300}
                      max={850}
                    />
                  </div>
                  <div>
                    <label className="label">Monthly Income</label>
                    <input
                      type="number"
                      value={input.monthlyIncome}
                      onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Down Payment</label>
                    <input
                      type="number"
                      value={input.downPayment}
                      onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Target Payment</label>
                    <input
                      type="number"
                      value={input.targetPayment}
                      onChange={(e) => handleInputChange('targetPayment', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Trade-In Section */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Trade-In</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Allowance</label>
                    <input
                      type="number"
                      value={input.tradeAllowance}
                      onChange={(e) => handleInputChange('tradeAllowance', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Payoff</label>
                    <input
                      type="number"
                      value={input.tradePayoff}
                      onChange={(e) => handleInputChange('tradePayoff', parseFloat(e.target.value))}
                      className="input"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Products
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={input.gapInsuranceSelected}
                      onChange={(e) => handleInputChange('gapInsuranceSelected', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">GAP Insurance</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={input.vscSelected}
                      onChange={(e) => handleInputChange('vscSelected', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm text-gray-700">Vehicle Service Contract</span>
                  </label>
                  {input.vscSelected && (
                    <select
                      value={input.vscTier}
                      onChange={(e) => handleInputChange('vscTier', e.target.value as VSCTier)}
                      className="select"
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Dealer Tier */}
              <div>
                <label className="label">Dealer Tier</label>
                <select
                  value={input.dealerTier}
                  onChange={(e) => handleInputChange('dealerTier', parseInt(e.target.value))}
                  className="select"
                >
                  {[1, 2, 3, 4, 5].map((tier) => (
                    <option key={tier} value={tier}>Tier {tier}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={rehashMutation.isPending}
              className="w-full btn btn-primary mt-6 py-3"
            >
              {rehashMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Deals
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="card p-12 text-center">
              <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Deal Parameters</h3>
              <p className="text-gray-600">Fill in the vehicle and customer information, then click Calculate to see lender options.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Banner */}
              <div className={cn(
                'card p-6',
                result.triage.mode === 'profit' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{result.triage.badge}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.triage.mode === 'profit' ? 'Profit Mode' : 'Survival Mode'}
                      </h3>
                    </div>
                    <p className="text-gray-600">{result.triage.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Book Value</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(result.bookValue)}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Down: {formatCurrency(result.totalDown)}</p>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Deal Analysis
                  </h3>
                  <button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending}
                    className="btn btn-secondary"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Deal'
                    )}
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="space-y-4">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                      aiAnalysis.status === 'good' && 'bg-green-100 text-green-700',
                      aiAnalysis.status === 'difficult' && 'bg-yellow-100 text-yellow-700',
                      aiAnalysis.status === 'impossible' && 'bg-red-100 text-red-700',
                      aiAnalysis.status === 'error' && 'bg-gray-100 text-gray-700'
                    )}>
                      {aiAnalysis.status === 'good' && <Check className="w-4 h-4" />}
                      {aiAnalysis.status === 'difficult' && <AlertCircle className="w-4 h-4" />}
                      {aiAnalysis.status === 'impossible' && <X className="w-4 h-4" />}
                      {aiAnalysis.status.charAt(0).toUpperCase() + aiAnalysis.status.slice(1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Analysis</h4>
                      <p className="text-gray-600">{aiAnalysis.analysis}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Strategy</h4>
                      <p className="text-gray-600">{aiAnalysis.strategy}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Click "Analyze Deal" to get AI-powered insights and recommendations.</p>
                )}
              </div>

              {/* Deal Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lender Options ({result.deals.filter(d => d.approved).length} approved)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isBest={deal.id === result.bestDeal?.id}
                      isSelected={deal.id === selectedDealId}
                      onSelect={() => setSelectedDealId(deal.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
