import { describe, it, expect } from 'vitest';
import { SwarmService } from '../service/SwarmService.js';

describe('OENEXA Autonomous Multi-Agent Swarm Service', () => {
  it('initializes specialized agent roles across architecture, engineering, security, and QA', () => {
    const swarm = new SwarmService();
    const agents = swarm.getAgents();

    expect(agents.length).toBeGreaterThanOrEqual(4);
    const roles = agents.map((a) => a.role);
    expect(roles).toContain('ARCHITECT');
    expect(roles).toContain('CODE_ENGINEER');
    expect(roles).toContain('DEVSECOPS');
    expect(roles).toContain('QA');
  });

  it('assigns tasks to matching roles and updates completed status', () => {
    const swarm = new SwarmService();
    const engineer = swarm.getAgents().find((a) => a.role === 'CODE_ENGINEER')!;

    const task = swarm.submitTask({
      title: 'Implement AMM swap routing logic',
      description: 'Implement constant product x*y=k formula in TypeScript',
      requiredRole: 'CODE_ENGINEER',
    });

    expect(task.status).toBe('PENDING');

    const completed = swarm.executeTask(engineer.id, task.id);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.assignedAgentId).toBe(engineer.id);
    expect(completed.output).toContain('Executed by');
  });

  it('rejects task execution when agent role does not match requirements', () => {
    const swarm = new SwarmService();
    const qa = swarm.getAgents().find((a) => a.role === 'QA')!;

    const architectTask = swarm.submitTask({
      title: 'Design multi-AZ database clustering blueprint',
      description: 'Draft ADR for zero-shared databases',
      requiredRole: 'ARCHITECT',
    });

    expect(() => {
      swarm.executeTask(qa.id, architectTask.id);
    }).toThrow(/Role mismatch/);
  });
});
