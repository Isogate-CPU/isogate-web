const OPERATIONS = ['LOAD', 'ADD', 'XOR', 'ROTATE'] as const;
const CHECKPOINT_CYCLES = [4, 9, 14, 19, 24] as const;

interface ReplayRequest {
  inputs: number[];
  cycles: number;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

self.onmessage = async (event: MessageEvent<ReplayRequest>) => {
  const { inputs, cycles } = event.data;
  const startedAt = performance.now();
  let accumulator = inputs[0] ?? 0;
  const trace = [];

  for (let cycle = 1; cycle <= cycles; cycle += 1) {
    const lane = (cycle - 1) % inputs.length;
    const input = inputs[lane];
    const operation = OPERATIONS[(cycle - 1) % OPERATIONS.length];
    const previous = accumulator;

    if (operation === 'LOAD') accumulator = input;
    if (operation === 'ADD') accumulator = (accumulator + input + cycle) & 0xff;
    if (operation === 'XOR') accumulator = accumulator ^ input;
    if (operation === 'ROTATE') accumulator = ((accumulator << 1) | (accumulator >> 7)) & 0xff;

    const ram = (input ^ ((cycle * 9 + 0x0e) & 0xff)) & 0xff;
    trace.push({
      cycle,
      pc: 0x20 + cycle * 4,
      accumulator,
      ram,
      zero: accumulator === 0,
      carry: operation === 'ADD' && previous + input + cycle > 0xff,
      halted: cycle === 32,
      lane,
      input,
      operation,
    });
  }

  const finalState = trace.at(-1);
  const outputs = inputs.map((input, lane) =>
    (input ^ accumulator ^ ((lane + 1) * 17)) & 0xff,
  );
  const checkpoints = CHECKPOINT_CYCLES.filter((cycle) => cycle <= cycles);
  const canonical = JSON.stringify({ inputs, cycles, finalState, outputs, checkpoints, trace });
  const digest = bytesToHex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical)),
  );

  self.postMessage({
    result: {
      engine: 'isogate-deterministic-replay-v1',
      digestAlgorithm: 'SHA-256',
      digest,
      inputs,
      requestedCycles: cycles,
      finalState,
      outputs,
      checkpoints,
      trace,
    },
    durationMs: performance.now() - startedAt,
  });
};