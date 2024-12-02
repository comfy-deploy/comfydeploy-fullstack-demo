// src/types.ts

export interface WorkflowInputs {
    id: string;
    batch: string;
    width: string;
    height: string;
    input_text: string;
  }
  
  export interface Image {
    url: string;
    type?: string;
    filename?: string;
  }
  
  export interface OutputData {
    images: Image[];
  }
  
  export interface Output {
    data: OutputData;
    id?: string;
    run_id?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ComfyDeployRun {
    id: string;
    workflowVersionId: string;
    workflowInputs: WorkflowInputs;
    workflowId: string;
    workflowApi: any | null;
    coldStartDuration: number;
    coldStartDurationTotal: number;
    createdAt: string; // Fecha en formato de cadena
    duration: number;
    endedAt: string; // Fecha en formato de cadena
    gpu: string;
    gpuEventId: string | null;
    isRealtime: boolean;
    liveStatus: string | null;
    machineId: string;
    machineType: string;
    machineVersion: string;
    modalFunctionCallId: string;
    number: number;
    orgId: string | null;
    origin: string;
    outputs: Output[];
    progress: number;
    queuedAt: string; // Fecha en formato de cadena
    runDuration: number;
    startedAt: string; // Fecha en formato de cadena
    status: string;
    updatedAt: string; // Fecha en formato de cadena
    userId: string;
    webhook: string;
    webhookIntermediateStatus: boolean;
    webhookStatus: string;
  }
  