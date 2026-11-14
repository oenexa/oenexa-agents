export type AgentRole = 'ARCHITECT' | 'CODE_ENGINEER' | 'DEVSECOPS' | 'QA';

export type AgentState = 'IDLE' | 'PLANNING' | 'EXECUTING' | 'WAITING' | 'COMPLETED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  state: AgentState;
  model: string;
  tasksCompleted: number;
}

export interface SwarmTask {
  id: string;
  title: string;
  description: string;
  requiredRole: AgentRole;
  assignedAgentId?: string;
  status: TaskStatus;
  output?: string;
  createdAt: string;
  completedAt?: string;
}
