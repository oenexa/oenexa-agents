import crypto from 'node:crypto';
import type { Agent, SwarmTask, AgentRole, AgentState, TaskStatus } from '../domain/types.js';

export class SwarmService {
  private agents = new Map<string, Agent>();
  private tasks = new Map<string, SwarmTask>();

  constructor() {
    this.registerAgent('lead-architect', 'ARCHITECT');
    this.registerAgent('principal-engineer', 'CODE_ENGINEER');
    this.registerAgent('devsecops-lead', 'DEVSECOPS');
    this.registerAgent('qa-automation', 'QA');
  }

  public registerAgent(name: string, role: AgentRole, model: string = 'gemini-2.5-pro'): Agent {
    const id = `agt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const agent: Agent = {
      id,
      name,
      role,
      state: 'IDLE',
      model,
      tasksCompleted: 0,
    };
    this.agents.set(id, agent);
    return agent;
  }

  public submitTask(params: {
    title: string;
    description: string;
    requiredRole: AgentRole;
  }): SwarmTask {
    const taskId = `tsk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const task: SwarmTask = {
      id: taskId,
      title: params.title,
      description: params.description,
      requiredRole: params.requiredRole,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Orchestrates assignment and execution of next eligible task by an agent
   */
  public executeTask(agentId: string, taskId: string): SwarmTask {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent '${agentId}' not found.`);

    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task '${taskId}' not found.`);

    if (task.requiredRole !== agent.role) {
      throw new Error(`Role mismatch: Task requires ${task.requiredRole}, agent has ${agent.role}.`);
    }

    agent.state = 'EXECUTING';
    task.assignedAgentId = agent.id;
    task.status = 'IN_PROGRESS';

    // Simulate task processing
    task.output = `Executed by ${agent.name} (${agent.role}): Verified requirements for '${task.title}'`;
    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();

    agent.state = 'IDLE';
    agent.tasksCompleted += 1;

    return task;
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getTasks(): SwarmTask[] {
    return Array.from(this.tasks.values());
  }
}
