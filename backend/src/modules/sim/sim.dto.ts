export interface SimInputs {
  revenueK: number;
  growthPct: number;
  marginPct: number;
  burnK: number;
  cashK: number;
  cac: number;
  ltm: number;
  horizonMonths: number;
}

export interface SimOutputs {
  endRevK: number;
  cumRevK: number;
  runwayMonths: number;
  breakevenMonth: number | null;
  ltvCac: number;
  scenario: string; // topline | bottomline | expansion | runway | fundraise | scenario
}

export interface SaveRunDto {
  sessionId: string;
  inputs: SimInputs;
  outputs: SimOutputs;
  label?: string;
}

export interface SaveRunResponse {
  runId: string;
  sessionId: string;
}

export interface LastRunResponse {
  found: boolean;
  inputs?: SimInputs;
  outputs?: SimOutputs;
  label?: string;
  runId?: string;
  unlocked?: boolean;
}

export interface UnlockDto {
  sessionId: string;
  email?: string;
  paymentRef?: string;
}

export interface UnlockResponse {
  unlocked: boolean;
  sessionId: string;
}
