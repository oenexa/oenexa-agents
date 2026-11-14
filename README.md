# OENEXA Agents Service (`oenexa-agents`)

> **Autonomous Multi-Agent Swarm Orchestrator & Task Execution Runtime**  
> Governed by the OENEXA AI Architecture & Autonomous Systems Organizations.

## 1. Domain Ownership
This repository authoritatively owns the **Autonomous Agents Domain**:
- **Owned Data**: Agent Profiles, Active Swarm Topologies, Swarm Message Board, Task States, Tool Execution Logs.
- **Owned APIs**: `POST /v1/agents/swarm`, `POST /v1/agents/tasks`, `GET /v1/agents/status`.
- **Database Boundary**: Isolated `oenexa-agents-prod-db`. Zero shared databases.
