export type ExecutionRequestedBy = 'user' | 'system';
export type ExecutionStepKind = 'observe' | 'plan' | 'apply' | 'verify' | 'learn';
export type ExecutionStepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export type ExecutionIntent = {
  id: string;
  goal: string;
  scope: string[];
  constraints: string[];
  requested_by: ExecutionRequestedBy;
};

export type ExecutionEvidence = {
  id: string;
  kind: 'finding' | 'plan' | 'apply' | 'verify' | 'note';
  artifact_path: string;
  digest?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionCheckpoint = {
  id: string;
  label: string;
  at_step_id: string;
  created_at: string;
};

export type ExecutionOutcome = {
  status: 'passed' | 'failed' | 'partial';
  summary: string;
  failure_cause?: string;
};

export type ExecutionStep = {
  id: string;
  kind: ExecutionStepKind;
  status: ExecutionStepStatus;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  evidence: ExecutionEvidence[];
  checkpoint?: ExecutionCheckpoint;
  started_at?: string;
  completed_at?: string;
};

export type ExecutionRun = {
  id: string;
  version: 1;
  intent: ExecutionIntent;
  steps: ExecutionStep[];
  checkpoints: ExecutionCheckpoint[];
  created_at: string;
  completed_at?: string;
  outcome?: ExecutionOutcome;
};
