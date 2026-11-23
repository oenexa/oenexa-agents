import crypto from 'node:crypto';

export interface AgentRiskContext {
  userId: string;
  action: 'WITHDRAWAL' | 'TRADE' | 'API_KEY_ROTATION' | 'PASSKEY_ENROLL';
  amountUsd: number;
  country: string;
  ipReputationScore: number; // 0 (Clean) to 100 (Malicious Tor/Proxy)
  userKycTier: 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';
  velocityLastHour: number;
}

export interface AgentWatchdogDecision {
  decisionId: string;
  status: 'APPROVED' | 'STEP_UP_CHALLENGE' | 'CONTAINMENT_FREEZE';
  riskScore: number;
  reason: string;
  recommendedAction: string;
  timestamp: string;
}

export class ComplianceWatchdogAgent {
  private sanctionedCountries = new Set<string>(['IR', 'KP', 'SY', 'CU', 'RU-CR']);
  private readonly MAX_UNVERIFIED_WITHDRAWAL_USD = 2000;
  private readonly HIGH_RISK_VELOCITY_THRESHOLD = 5;

  public evaluateRisk(ctx: AgentRiskContext): AgentWatchdogDecision {
    let score = 0;
    const reasons: string[] = [];

    // 1. Sanctioned Geography Filter
    if (this.sanctionedCountries.has(ctx.country.toUpperCase())) {
      return {
        decisionId: `dec_${crypto.randomBytes(8).toString('hex')}`,
        status: 'CONTAINMENT_FREEZE',
        riskScore: 100,
        reason: `OFAC/Sanctioned Jurisdiction direct match: ${ctx.country}`,
        recommendedAction: 'Freeze session and dispatch SIEM security incident',
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Unverified KYC Limits
    if (ctx.userKycTier === 'TIER_0' && ctx.amountUsd > this.MAX_UNVERIFIED_WITHDRAWAL_USD) {
      score += 65;
      reasons.push(`TIER_0 withdrawal exceeds limit ($${ctx.amountUsd} > $${this.MAX_UNVERIFIED_WITHDRAWAL_USD})`);
    }

    // 3. IP Proxy / Threat Intelligence
    if (ctx.ipReputationScore > 75) {
      score += 40;
      reasons.push(`High-risk proxy/Tor exit node IP score: ${ctx.ipReputationScore}`);
    }

    // 4. Hourly Velocity Spike
    if (ctx.velocityLastHour >= this.HIGH_RISK_VELOCITY_THRESHOLD) {
      score += 35;
      reasons.push(`Velocity spike anomaly: ${ctx.velocityLastHour} sensitive actions/hr`);
    }

    const normalizedScore = Math.min(100, score);

    let status: 'APPROVED' | 'STEP_UP_CHALLENGE' | 'CONTAINMENT_FREEZE' = 'APPROVED';
    let recommendedAction = 'Allow request';

    if (normalizedScore >= 75) {
      status = 'CONTAINMENT_FREEZE';
      recommendedAction = 'Quarantine transaction and alert compliance officer';
    } else if (normalizedScore >= 35) {
      status = 'STEP_UP_CHALLENGE';
      recommendedAction = 'Require WebAuthn FIDO2 biometric confirmation';
    }

    return {
      decisionId: `dec_${crypto.randomBytes(8).toString('hex')}`,
      status,
      riskScore: normalizedScore,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Normal risk profile',
      recommendedAction,
      timestamp: new Date().toISOString(),
    };
  }
}
