export type Checkpoint = {
  number: string;
  title: string;
  detail: string;
  completeAt: number;
};

export const checkpoints: Checkpoint[] = [
  { number: '01', title: 'Exhaustive vector sweep', detail: 'Every operand and carry state is compared against plain arithmetic.', completeAt: 4 },
  { number: '02', title: 'Independent model', detail: 'A deliberately separate implementation must agree with the gate array.', completeAt: 9 },
  { number: '03', title: 'Shipped-path test', detail: 'The model runs through the exact simulator loaded in this browser.', completeAt: 14 },
  { number: '04', title: 'Liveness test', detail: 'Long random-input runs confirm the machine never gets stuck.', completeAt: 19 },
  { number: '05', title: 'Contract-level check', detail: 'EVM execution is compared block-by-block across state and halt bit.', completeAt: 24 },
];

export const opcodes = [
  ['0000', 'MOV', 'Register transfer', 'R[d] ← R[s]'],
  ['0001', 'ADD', 'Integer addition', 'R[d] ← R[a] + R[b]'],
  ['0010', 'XOR', 'Bitwise exclusive OR', 'R[d] ← R[a] ⊕ R[b]'],
  ['0011', 'AND', 'Bitwise conjunction', 'R[d] ← R[a] ∧ R[b]'],
  ['0100', 'LD', 'Load from RAM', 'R[d] ← RAM[address]'],
  ['0101', 'ST', 'Store to RAM', 'RAM[address] ← R[s]'],
  ['0110', 'JNZ', 'Conditional branch', 'if R[s] ≠ 0 → PC + offset'],
  ['1111', 'HALT', 'Stop execution', 'halt ← 1'],
];

export const comparisonRows = [
  ['Current focus', 'Bounded deterministic CPU replay technical beta', 'Volunteer scientific work units', 'Commercial distributed compute providers', 'Cloud capacity / GPU rendering markets', 'Verifiable or confidential computation'],
  ['Result checking', 'Server recomputes a canonical result; no independent verifier network', 'Project-specific validation, redundancy, credits, or points', 'Platform- and workload-specific trust and verification', 'Platform-specific deployment or rendering validation', 'Cryptographic proofs or trusted execution, depending on system'],
  ['Provider rewards', 'Not implemented', 'Typically volunteer credits or points', 'Platform rewards or GLM payments, depending on network', 'AKT or RENDER incentives', 'Protocol-specific fees or incentives'],
  ['Workload scope', 'Built-in eight-byte, 1–32 cycle replay only', 'Approved scientific applications and work units', 'Containerized or application-defined workloads', 'Deployments or rendering jobs', 'Circuits, VMs, models, or enclave workloads'],
  ['Chain status', 'Robinhood Chain wallet UI access; no contract deployment', 'Not chain-dependent', 'Golem uses GLM; Salad is not a blockchain protocol', 'Network-specific token infrastructure', 'Protocol-specific'],
];