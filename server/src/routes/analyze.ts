import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import {
  AnalyzeDealRequestSchema,
  type AnalyzeDealRequest,
  type AnalyzeDealResponse,
  type DealCandidate,
} from '@salesapexai/shared';

const router = Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

// Helper to format deal for prompt
function formatDealForPrompt(deal: DealCandidate): string {
  return `
- Lender: ${deal.lenderName} (${deal.programName})
- Monthly Payment: $${deal.monthlyPayment.toFixed(2)}
- APR: ${deal.aprPercent.toFixed(2)}%
- Term: ${deal.term} months
- Amount Financed: $${deal.amountFinanced.toFixed(2)}
- LTV: ${deal.ltv.toFixed(1)}% (Cap: ${deal.ltvCap}%)
- PTI: ${deal.ptiPercent.toFixed(1)}% (Valid: ${deal.ptiValid})
- Dealer Profit: $${deal.totalDealerProfit.toFixed(2)}
- Net Check: $${deal.netCheckToDealer.toFixed(2)}
- Approval Probability: ${(deal.approvalProbability * 100).toFixed(0)}%
- Status: ${deal.approved ? 'APPROVED' : 'DECLINED'}
${deal.rejectionReasons.length > 0 ? `- Rejection Reasons: ${deal.rejectionReasons.join(', ')}` : ''}
`;
}

// POST /api/analyze-deal
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parseResult = AnalyzeDealRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: 'error',
        analysis: 'Invalid request data',
        strategy: 'Please check the deal input parameters.',
      } satisfies AnalyzeDealResponse);
    }

    const { dealInput, dealCandidates, selectedCandidateId } = parseResult.data;

    // Check if we have API key
    if (!process.env.GROQ_API_KEY) {
      // Return a mock response for development
      const approvedCount = dealCandidates.filter(d => d.approved).length;
      const status = approvedCount >= 2 ? 'good' : approvedCount === 1 ? 'difficult' : 'impossible';

      return res.json({
        status,
        analysis: `Based on the deal parameters, ${approvedCount} of ${dealCandidates.length} lenders would approve this deal. Customer has a ${dealInput.customerFico} FICO score with $${dealInput.monthlyIncome} monthly income. Target payment is $${dealInput.targetPayment}/month.`,
        strategy: approvedCount > 0
          ? 'Proceed with the approved lenders. Consider increasing down payment to improve terms.'
          : 'This deal may require restructuring. Consider reducing vehicle price, increasing down payment, or finding a co-signer.',
      } satisfies AnalyzeDealResponse);
    }

    // Get top 3 candidates for analysis
    const topCandidates = dealCandidates
      .sort((a, b) => {
        if (a.approved !== b.approved) return a.approved ? -1 : 1;
        return b.totalDealerProfit - a.totalDealerProfit;
      })
      .slice(0, 3);

    // Selected candidate if specified
    const selectedDeal = selectedCandidateId
      ? dealCandidates.find(d => d.id === selectedCandidateId)
      : null;

    // Build prompt
    const prompt = `You are an expert automotive finance manager analyzing a car deal. Provide a brief, professional assessment.

DEAL DETAILS:
- Vehicle: ${dealInput.vehicleYear} ${dealInput.vehicleMake} ${dealInput.vehicleModel || ''}
- Retail Price: $${dealInput.vehicleRetailPrice.toLocaleString()}
- Cost: $${dealInput.vehicleCost.toLocaleString()}
- Mileage: ${dealInput.vehicleMileage.toLocaleString()} miles
- State: ${dealInput.state}

CUSTOMER:
- FICO Score: ${dealInput.customerFico}
- Monthly Income: $${dealInput.monthlyIncome.toLocaleString()}
- Down Payment: $${dealInput.downPayment.toLocaleString()}
- Trade Allowance: $${dealInput.tradeAllowance.toLocaleString()}
- Trade Payoff: $${dealInput.tradePayoff.toLocaleString()}
- Target Payment: $${dealInput.targetPayment}/month

PRODUCTS SELECTED:
- GAP Insurance: ${dealInput.gapInsuranceSelected ? 'Yes' : 'No'}
- VSC: ${dealInput.vscSelected ? `Yes (${dealInput.vscTier})` : 'No'}

TOP LENDER OPTIONS:
${topCandidates.map(formatDealForPrompt).join('\n')}

${selectedDeal ? `CUSTOMER SELECTED: ${selectedDeal.lenderName} at $${selectedDeal.monthlyPayment.toFixed(2)}/month` : ''}

Respond with a JSON object containing exactly these fields:
- "status": one of "good", "difficult", or "impossible" based on deal viability
- "analysis": 2-3 sentences summarizing the deal situation and key factors
- "strategy": 2-3 sentences of specific, actionable advice for closing this deal

Respond ONLY with the JSON object, no other text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional automotive finance analyst. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model,
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const response: AnalyzeDealResponse = {
          status: ['good', 'difficult', 'impossible'].includes(parsed.status)
            ? parsed.status
            : 'error',
          analysis: parsed.analysis || 'Unable to analyze deal.',
          strategy: parsed.strategy || 'Please review the deal parameters.',
        };
        return res.json(response);
      }
    } catch {
      // JSON parsing failed
    }

    // Fallback response if parsing fails
    const approvedCount = dealCandidates.filter(d => d.approved).length;
    res.json({
      status: approvedCount >= 2 ? 'good' : approvedCount === 1 ? 'difficult' : 'impossible',
      analysis: content || 'AI analysis unavailable. Please review the deal manually.',
      strategy: 'Review the lender options above and select the best fit for the customer.',
    } satisfies AnalyzeDealResponse);
  } catch (error) {
    console.error('Error analyzing deal:', error);
    res.status(500).json({
      status: 'error',
      analysis: 'An error occurred during analysis.',
      strategy: 'Please try again or review the deal manually.',
    } satisfies AnalyzeDealResponse);
  }
});

export default router;
