import { describe, it, expect } from 'vitest';
import { ComplianceWatchdogAgent, type AgentRiskContext } from '../service/ComplianceWatchdogAgent.js';

describe('ComplianceWatchdogAgent Autonomous Risk Triaging', () => {
  const agent = new ComplianceWatchdogAgent();

  it('approves legitimate low-risk requests seamlessly', () => {
    const ctx: AgentRiskContext = {
      userId: 'usr_valid_trader',
      action: 'TRADE',
      amountUsd: 500,
      country: 'CH',
      ipReputationScore: 5,
      userKycTier: 'TIER_2',
      velocityLastHour: 1,
    };

    const decision = agent.evaluateRisk(ctx);
    expect(decision.status).toBe('APPROVED');
    expect(decision.riskScore).toBe(0);
    expect(decision.recommendedAction).toBe('Allow request');
  });

  it('triggers CONTAINMENT_FREEZE for requests from sanctioned jurisdictions', () => {
    const ctx: AgentRiskContext = {
      userId: 'usr_sanctioned_attempt',
      action: 'WITHDRAWAL',
      amountUsd: 1000,
      country: 'KP', // Sanctioned
      ipReputationScore: 10,
      userKycTier: 'TIER_1',
      velocityLastHour: 1,
    };

    const decision = agent.evaluateRisk(ctx);
    expect(decision.status).toBe('CONTAINMENT_FREEZE');
    expect(decision.riskScore).toBe(100);
    expect(decision.reason).toContain('OFAC/Sanctioned');
  });

  it('enforces STEP_UP_CHALLENGE when proxy IP and velocity spikes occur', () => {
    const ctx: AgentRiskContext = {
      userId: 'usr_suspect_velocity',
      action: 'WITHDRAWAL',
      amountUsd: 800,
      country: 'DE',
      ipReputationScore: 80, // +40
      userKycTier: 'TIER_1',
      velocityLastHour: 2,
    };

    const decision = agent.evaluateRisk(ctx);
    expect(decision.status).toBe('STEP_UP_CHALLENGE');
    expect(decision.riskScore).toBe(40);
    expect(decision.recommendedAction).toContain('WebAuthn FIDO2 biometric confirmation');
  });
});
