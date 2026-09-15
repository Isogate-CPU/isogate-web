import { useState, type ChangeEvent } from 'react';
import {
  useHealthCheck,
  useReplayCpu,
  useRegisterProvider,
  useRunProviderJob,
  useCreateProviderWalletChallenge,
  useBindProviderWallet,
  useRotateProviderCredential,
  useRevokeProviderCredential,
  getProviderJob,
  type ComputeProvider,
  type ProviderJob,
  type ReplayResult,
  type TraceFrame,
} from '@api-client';
import { useConsoleAccess } from '../components/wallet-access';
import { useSignMessage } from 'wagmi';
import { 
  Activity, AlertTriangle, BookOpen, Cpu, HardDrive,
  Hash, LayoutGrid, Menu, Play, Server,
  Settings2, ShieldCheck, X, AlertCircle, Upload, Copy, Link2,
  WalletCards, RotateCw, Trash2
} from 'lucide-react';

const logoUrl = `${import.meta.env.BASE_URL}isogate-logo.png`;

interface LocalReplay {
  result: ReplayResult;
  durationMs: number;
}

interface NativeCpuReport {
  schemaVersion: 1;
  capturedAt: string;
  runtime: {
    platform: string;
    release: string;
    architecture: string;
    architectureFamily: string;
    nodeVersion: string;
  };
  cpu: {
    vendor: string;
    model: string;
    logicalProcessors: number;
    reportedMhz: number | null;
  };
  memory: {
    totalBytes: number;
    freeBytes: number;
  };
  benchmark: {
    algorithm: 'SHA-256';
    iterations: number;
    durationMs: number;
    operationsPerSecond: number;
    digest: string;
  };
  reportDigest: string;
}

function isNativeCpuReport(value: unknown): value is NativeCpuReport {
  if (!value || typeof value !== 'object') return false;
  const report = value as Partial<NativeCpuReport>;
  return report.schemaVersion === 1
    && typeof report.capturedAt === 'string'
    && typeof report.reportDigest === 'string'
    && typeof report.runtime?.platform === 'string'
    && typeof report.runtime?.release === 'string'
    && typeof report.runtime?.architecture === 'string'
    && typeof report.runtime?.architectureFamily === 'string'
    && typeof report.runtime?.nodeVersion === 'string'
    && typeof report.cpu?.vendor === 'string'
    && typeof report.cpu?.model === 'string'
    && Number.isInteger(report.cpu?.logicalProcessors)
    && (report.cpu?.reportedMhz === null || typeof report.cpu?.reportedMhz === 'number')
    && typeof report.memory?.totalBytes === 'number'
    && typeof report.memory?.freeBytes === 'number'
    && report.benchmark?.algorithm === 'SHA-256'
    && Number.isInteger(report.benchmark?.iterations)
    && typeof report.benchmark?.durationMs === 'number'
    && typeof report.benchmark?.operationsPerSecond === 'number'
    && typeof report.benchmark?.digest === 'string';
}

async function verifyNativeCpuReport(report: NativeCpuReport) {
  const { reportDigest, ...payload } = report;
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return actual === reportDigest;
}

function runLocalReplay(inputs: number[], cycles: number): Promise<LocalReplay> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/cpu-replay.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<LocalReplay>) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = () => {
      reject(new Error('Local CPU worker failed'));
      worker.terminate();
    };
    worker.postMessage({ inputs, cycles });
  });
}

export interface ConsolePageProps {
  walletEnabled?: boolean;
}

export function ConsolePage({ walletEnabled = true }: ConsolePageProps) {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-4rem)] w-full bg-[#0d0e0c] text-[#e9ebdf] font-sans overflow-hidden">
      <ConsoleSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <ConsoleContent walletEnabled={walletEnabled} />
      </main>
    </div>
  );
}

function ConsoleSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: health, isError, isLoading } = useHealthCheck();

  return (
    <aside className={`w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-[#2a3621] bg-[#090b08] flex flex-col z-20 ${isOpen ? 'h-[100dvh] absolute inset-0 md:relative md:h-auto' : 'h-[60px] md:h-auto'}`}>
      <div className="p-4 md:p-5 border-b border-[#2a3621] flex items-center justify-between gap-3 h-[60px] md:h-auto shrink-0 bg-[#090b08]">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 object-contain" />
          <div>
            <h1 className="font-mono text-sm font-bold tracking-widest text-[#d7ff32]">ISOGATE</h1>
            <div className="font-mono text-[10px] text-[#596252] tracking-widest">DETERMINISTIC CONSOLE</div>
          </div>
        </div>
        <button className="md:hidden text-[#d7ff32]" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto p-5 flex-col gap-6 bg-[#090b08]`}>
        <section>
          <h2 className="font-mono text-[10px] text-[#596252] tracking-widest mb-3 uppercase">API Connection</h2>
          <div className="flex items-center gap-3 bg-[#11150e] border border-[#2a3621] p-3 rounded-sm">
            <Server size={14} className="text-[#88917d]" />
            <div className="flex-1">
              <div className="font-mono text-[11px] text-[#e9ebdf]">Server Health</div>
              <div className="font-mono text-[10px] text-[#596252]">
                {isLoading ? 'Checking...' : isError ? 'Offline' : health?.status === 'ok' ? 'Connected' : health?.status || 'Unknown'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : isError ? 'bg-red-500' : health?.status === 'ok' ? 'bg-[#d7ff32] shadow-[0_0_8px_#d7ff32]' : 'bg-gray-500'}`} />
          </div>
        </section>

        <section>
          <h2 className="font-mono text-[10px] text-[#596252] tracking-widest mb-3 uppercase">System Rules</h2>
          <ul className="space-y-2 text-[#88917d] text-xs leading-relaxed">
            <li className="flex gap-2"><div className="mt-0.5 text-[#d7ff32]"><HardDrive size={12}/></div> Fixed byte input bounds (8 bytes).</li>
            <li className="flex gap-2"><div className="mt-0.5 text-[#d7ff32]"><Activity size={12}/></div> Cycle bounds enforced (1-32).</li>
            <li className="flex gap-2"><div className="mt-0.5 text-[#d7ff32]"><BookOpen size={12}/></div> Output digest is deterministic SHA-256, not a cryptographic proof.</li>
          </ul>
        </section>
      </div>
      
      <div className={`${isOpen ? 'block' : 'hidden'} md:block p-4 border-t border-[#2a3621] font-mono text-[10px] text-[#596252] uppercase text-center bg-[#090b08]`}>
        <a href="?page=home" className="hover:text-[#d7ff32] transition-colors inline-flex items-center gap-2">
          &larr; Return to simulation
        </a>
      </div>
    </aside>
  );
}

function HexInput({ value, onChange, disabled, index }: { value: string, onChange: (v: string) => void, disabled: boolean, index: number }) {
  return (
    <div className="relative flex-1 md:flex-none">
      <input
        aria-label={`Input byte ${index}, hexadecimal`}
        type="text"
        maxLength={2}
        value={value}
        onChange={(e) => {
          const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
          onChange(val);
        }}
        onBlur={() => {
           if(value.length === 1) onChange(`0${value}`);
           if(value.length === 0) onChange('00');
        }}
        disabled={disabled}
        className="w-full md:w-[42px] h-[42px] bg-[#11150e] border border-[#2a3621] text-center font-mono text-xs text-[#e9ebdf] outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-all disabled:opacity-50"
      />
      <div className="absolute -top-2 -right-1 bg-[#0d0e0c] px-0.5 text-[8px] font-mono text-[#596252]">
        {index}
      </div>
    </div>
  );
}

function StateRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-xs border-b border-[#2a3621] pb-2 last:border-0 last:pb-0">
      <span className="text-[#596252]">{label}</span>
      <span className="text-[#e9ebdf]">{value}</span>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [feedback, setFeedback] = useState('');

  const copy = async () => {
    setFeedback('');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(value);
      setFeedback('COPIED');
    } catch {
      setFeedback('COPY FAILED');
    }
  };

  return (
    <span className="inline-flex w-full shrink-0 flex-col items-end gap-1 sm:w-auto">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 border border-[#536345] px-2.5 font-mono text-[9px] tracking-widest text-[#d7ff32] hover:border-[#d7ff32] sm:w-auto"
        aria-label="Copy command"
      >
        <Copy size={12} /> COPY
      </button>
      {feedback && (
        <span className={feedback === 'COPIED' ? 'text-[9px] text-[#d7ff32]' : 'text-[9px] text-[#e49393]'} role="status">
          {feedback}
        </span>
      )}
    </span>
  );
}

function CommandBlock({ label, command }: { label: string; command: string }) {
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-3 border border-[#2a3621] bg-[#090b08] p-2.5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-mono text-[9px] tracking-widest text-[#596252]">{label}</div>
        <code className="block whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-[#c7d0bf]">{command}</code>
      </div>
      <CopyButton value={command} />
    </div>
  );
}

function TraceGrid({ trace }: { trace: TraceFrame[] }) {
  return (
    <div className="w-full border border-[#2a3621] bg-[#11150e] rounded-sm overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono whitespace-nowrap">
          <thead className="bg-[#0d0e0c] border-b border-[#2a3621] text-[10px] text-[#596252] tracking-widest">
            <tr>
              <th className="px-4 py-3 font-normal">CYCLE</th>
              <th className="px-4 py-3 font-normal">PC</th>
              <th className="px-4 py-3 font-normal">OP</th>
              <th className="px-4 py-3 font-normal">LANE</th>
              <th className="px-4 py-3 font-normal">IN</th>
              <th className="px-4 py-3 font-normal">ACC</th>
              <th className="px-4 py-3 font-normal">RAM</th>
              <th className="px-4 py-3 font-normal">Z/C</th>
              <th className="px-4 py-3 font-normal">HALT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a3621]/50 text-[#88917d] text-[11px]">
            {trace.map((frame, i) => (
              <tr key={i} className="hover:bg-[#1a2215] transition-colors">
                <td className="px-4 py-2.5 text-[#d7ff32]">{frame.cycle}</td>
                <td className="px-4 py-2.5">0x{frame.pc.toString(16).padStart(4, '0').toUpperCase()}</td>
                <td className="px-4 py-2.5 text-[#e9ebdf]">{frame.operation}</td>
                <td className="px-4 py-2.5">{frame.lane}</td>
                <td className="px-4 py-2.5">0x{frame.input.toString(16).padStart(2, '0').toUpperCase()}</td>
                <td className="px-4 py-2.5 text-[#e9ebdf]">0x{frame.accumulator.toString(16).padStart(2, '0').toUpperCase()}</td>
                <td className="px-4 py-2.5 text-[#e9ebdf]">0x{frame.ram.toString(16).padStart(2, '0').toUpperCase()}</td>
                <td className="px-4 py-2.5">
                  <span className={frame.zero ? 'text-[#d7ff32]' : ''}>{frame.zero ? '1' : '0'}</span>
                  <span className="opacity-50 mx-1">/</span>
                  <span className={frame.carry ? 'text-[#d7ff32]' : ''}>{frame.carry ? '1' : '0'}</span>
                </td>
                <td className="px-4 py-2.5">
                  {frame.halted ? <span className="text-red-400 bg-red-400/10 px-1 py-0.5 rounded">HLT</span> : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConsoleContent({ walletEnabled }: { walletEnabled: boolean }) {
  if (!walletEnabled) return <ConsoleWorkspace isReady={false} walletAddress={undefined} signMessageAsync={undefined} />;
  return <ConnectedConsoleWorkspace />;
}

function ConnectedConsoleWorkspace() {
  const access = useConsoleAccess();
  const { signMessageAsync } = useSignMessage();
  return (
    <ConsoleWorkspace
      isReady={access.isReady}
      walletAddress={access.address}
      signMessageAsync={signMessageAsync}
    />
  );
}

function ConsoleWorkspace({
  isReady,
  walletAddress,
  signMessageAsync,
}: {
  isReady: boolean;
  walletAddress?: string;
  signMessageAsync?: (args: { message: string }) => Promise<`0x${string}`>;
}) {
  const replayCpu = useReplayCpu();
  const registerProvider = useRegisterProvider();
  const [providerCredential, setProviderCredential] = useState<string | null>(null);
  const credentialRequest = providerCredential
    ? { headers: { 'X-Isogate-Provider-Credential': providerCredential } }
    : undefined;
  const runProviderJob = useRunProviderJob({ request: credentialRequest });
  const createWalletChallenge = useCreateProviderWalletChallenge({ request: credentialRequest });
  const bindWallet = useBindProviderWallet({ request: credentialRequest });
  const rotateCredential = useRotateProviderCredential({ request: credentialRequest });
  const revokeCredential = useRevokeProviderCredential({ request: credentialRequest });
  
  const [inputs, setInputs] = useState<string[]>(['42', '17', '00', '01', 'A8', '3C', '10', 'FF']);
  const [cycles, setCycles] = useState<number>(32);
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [localReplay, setLocalReplay] = useState<LocalReplay | null>(null);
  const [localError, setLocalError] = useState('');
  const [nativeReport, setNativeReport] = useState<NativeCpuReport | null>(null);
  const [nativeReportError, setNativeReportError] = useState('');
  const [provider, setProvider] = useState<ComputeProvider | null>(null);
  const [providerJob, setProviderJob] = useState<ProviderJob | null>(null);
  const [isAwaitingNative, setIsAwaitingNative] = useState(false);
  const [walletActionError, setWalletActionError] = useState('');
  const [credentialNotice, setCredentialNotice] = useState('');

  const handleNativeReport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setNativeReportError('');

    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isNativeCpuReport(parsed) || !(await verifyNativeCpuReport(parsed))) {
        throw new Error('Invalid report');
      }
      setNativeReport(parsed);
      const registered = await registerProvider.mutateAsync({ data: { report: parsed } });
      setProvider(registered.provider);
      setProviderCredential(registered.credential);
      setProviderJob(null);
      setCredentialNotice('Credential issued in browser memory only. The Native Node will request it at its hidden prompt.');
    } catch {
      setNativeReport(null);
      setProvider(null);
      setProviderCredential(null);
      setNativeReportError('The native report could not be verified or registered.');
    }
  };

  const walletBound = Boolean(
    provider?.walletAddress &&
    walletAddress &&
    provider.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  );

  const handleBindWallet = async () => {
    if (!provider || !providerCredential || !walletAddress || !isReady || !signMessageAsync) {
      setWalletActionError('Connect the wallet on Robinhood Chain before binding provider ownership.');
      return;
    }
    setWalletActionError('');
    try {
      const challenge = await createWalletChallenge.mutateAsync({
        providerId: provider.id,
        data: { walletAddress },
      });
      const signature = await signMessageAsync({ message: challenge.message });
      const bound = await bindWallet.mutateAsync({
        providerId: provider.id,
        data: {
          walletAddress,
          message: challenge.message,
          signature,
        },
      });
      setProvider(bound);
    } catch (error) {
      setWalletActionError(error instanceof Error ? error.message : 'Wallet ownership binding was not completed.');
    }
  };

  const handleRotateCredential = async () => {
    if (!provider || !providerCredential) {
      setCredentialNotice('Register a provider first; the current credential is required to rotate it.');
      return;
    }
    setCredentialNotice('');
    try {
      const rotated = await rotateCredential.mutateAsync({ providerId: provider.id });
      setProviderCredential(rotated.credential);
      setCredentialNotice('Credential rotated. Restart the Native Node and paste the replacement at its hidden prompt.');
    } catch (error) {
      setCredentialNotice(error instanceof Error ? error.message : 'Credential rotation failed.');
    }
  };

  const handleRevokeCredential = async () => {
    if (!provider || !providerCredential) {
      setCredentialNotice('Register a provider first; the current credential is required to revoke it.');
      return;
    }
    if (!window.confirm('Revoke this provider credential? Native Node control and provider jobs will stop immediately.')) return;
    setCredentialNotice('');
    try {
      await revokeCredential.mutateAsync({ providerId: provider.id });
      setProviderCredential(null);
      setProvider(null);
      setProviderJob(null);
      setNativeReport(null);
      setIsAwaitingNative(false);
      setCredentialNotice('Provider credential revoked. Provider access has been cleared from this page.');
    } catch (error) {
      setCredentialNotice(error instanceof Error ? error.message : 'Credential revocation failed.');
    }
  };

  const handleSubmit = async () => {
    if (!isReady) return;
    if (provider && !walletBound) {
      setLocalError('Bind the provider to the connected wallet before submitting a native job.');
      return;
    }
    
    const parsedInputs = inputs.map(hex => parseInt(hex, 16) || 0);

    setResult(null);
    setLocalReplay(null);
    setLocalError('');
    setProviderJob(null);
    setIsAwaitingNative(false);

    try {
      const local = await runLocalReplay(parsedInputs, cycles);
      setLocalReplay(local);
      if (!provider) {
        setResult(await replayCpu.mutateAsync({ data: { inputs: parsedInputs, cycles } }));
        return;
      }

      const queued = await runProviderJob.mutateAsync({
        providerId: provider.id,
        data: { inputs: parsedInputs, cycles },
      });
      setProviderJob(queued);
      setIsAwaitingNative(true);
      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        const current = await getProviderJob(provider.id, queued.id);
        setProviderJob(current);
        if (current.status === 'completed' && current.result) {
          if ('digest' in current.result) setResult(current.result);
          setIsAwaitingNative(false);
          return;
        }
        if (current.status === 'rejected') {
          throw new Error('Native provider result was rejected.');
        }
      }
      throw new Error('Native provider did not complete the job within two minutes.');
    } catch (error) {
      setIsAwaitingNative(false);
      if (error instanceof Error && error.message === 'Local CPU worker failed') {
        setLocalError('The browser could not start its local CPU worker.');
      } else if (error instanceof Error) {
        setLocalError(error.message);
      }
    }
  };

  const digestsMatch = Boolean(
    result && localReplay && result.digest === localReplay.result.digest,
  );
  const logicalProcessors = navigator.hardwareConcurrency || 1;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="shrink-0 border-b border-[#2a3621] bg-[#0d0e0c] p-4 md:p-6">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm tracking-widest text-[#d7ff32] flex items-center gap-2">
              <Settings2 size={16} /> NODE ACTIVATION
            </h2>
          </div>

          <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Node activation progress">
            {[
              ['01 DEVICE', 'DETECTED', true],
              ['02 NATIVE', provider ? 'REGISTERED' : nativeReport ? 'VERIFYING' : 'OPTIONAL', Boolean(provider)],
              ['03 ACCESS', isReady ? 'READY' : 'WAITING', isReady],
              ['04 REPLAY', result && digestsMatch ? 'VERIFIED' : 'PENDING', Boolean(result && digestsMatch)],
            ].map(([label, status, active]) => (
              <li key={String(label)} className={`border p-2 font-mono text-[9px] tracking-wider ${active ? 'border-[#d7ff32]/40 bg-[#d7ff32]/5' : 'border-[#2a3621] bg-[#11150e]'}`}>
                <div className={active ? 'text-[#d7ff32]' : 'text-[#596252]'}>{label}</div>
                <div className="mt-1 text-[#c7d0bf]">{status}</div>
              </li>
            ))}
          </ol>

          <div className="mb-5 border border-[#2a3621] bg-[#11150e] p-3">
            <div className="border-b border-[#2a3621] pb-4">
              <div className="font-mono text-[10px] tracking-widest text-[#c7d0bf]">NATIVE NODE ONBOARDING</div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#596252]">
                Install the node, generate a local diagnostic report, then import it below. Commands run on your device, not in this browser.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <CommandBlock label="1 · INSTALL FROM NPM" command="npm install -g @isogate/node@0.3.1" />
                <div className="space-y-2">
                  <a
                    href="https://www.npmjs.com/package/@isogate/node"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1.5 font-mono text-[10px] text-[#d7ff32] underline underline-offset-4 hover:text-[#e4ff74]"
                  >
                    <Link2 size={12} /> VIEW @isogate/node ON NPM
                  </a>
                  <CommandBlock label="PACKAGE INSTALL" command="npm install -g @isogate/node@0.3.1" />
                </div>
                <CommandBlock label="2 · DIAGNOSE" command="isogate-node diagnose --output isogate-diagnostic.json" />
                <div className="flex items-center border border-[#2a3621] bg-[#090b08] p-2.5">
                  <p className="text-[11px] leading-relaxed text-[#c7d0bf]">
                    3 · Run <strong className="font-mono text-[#d7ff32]">Import Report</strong> and keep the generated credential private.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-[#c7d0bf]">NATIVE DEVICE REPORT</div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#596252]">
                  Import the JSON generated by Isogate Native Node. Its digest is verified locally and by the backend before registration.
                </p>
              </div>
              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-[#536345] px-4 font-mono text-[10px] tracking-widest text-[#d7ff32] hover:border-[#d7ff32] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#d7ff32]">
                <Upload size={13} /> {registerProvider.isPending ? 'REGISTERING...' : 'IMPORT REPORT'}
                <input className="sr-only" type="file" accept="application/json,.json" onChange={handleNativeReport} disabled={registerProvider.isPending} />
              </label>
            </div>
            {nativeReportError && <p className="mt-3 text-xs text-[#e49393]" role="alert">{nativeReportError}</p>}
            {nativeReport && (
              <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[#2a3621] pt-4 md:grid-cols-4">
                <div><dt className="font-mono text-[9px] text-[#596252]">CPU</dt><dd className="mt-1 text-xs text-[#e9ebdf]">{nativeReport.cpu.vendor} · {nativeReport.cpu.model}</dd></div>
                <div><dt className="font-mono text-[9px] text-[#596252]">ARCHITECTURE</dt><dd className="mt-1 text-xs text-[#e9ebdf]">{nativeReport.runtime.architectureFamily} · {nativeReport.cpu.logicalProcessors} threads</dd></div>
                <div><dt className="font-mono text-[9px] text-[#596252]">MEMORY</dt><dd className="mt-1 text-xs text-[#e9ebdf]">{(nativeReport.memory.totalBytes / 1024 ** 3).toFixed(1)} GB</dd></div>
                <div><dt className="font-mono text-[9px] text-[#596252]">REAL BENCHMARK</dt><dd className="mt-1 text-xs text-[#d7ff32]">{nativeReport.benchmark.operationsPerSecond.toLocaleString()} ops/s</dd></div>
              </dl>
            )}
            {provider && (
              <div className="mt-4 border-t border-[#2a3621] pt-3 font-mono text-[9px] text-[#596252]">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span>PROVIDER {provider.id}</span>
                  <span className="text-[#d7ff32]">● {provider.status.toUpperCase()} · BACKEND REGISTERED</span>
                </div>
                 <div className="mt-3">
                   <CommandBlock
                      label="4 · START NATIVE NODE (CREDENTIAL AT HIDDEN PROMPT)"
                      command={`isogate-node start --server ${window.location.origin}/api --provider ${provider.id}`}
                   />
                 </div>
                 <p className="mt-2 text-[#c7d0bf]">
                   The start command intentionally omits the credential. Native Node prompts for it
                   with terminal echo disabled; paste the credential from this browser session at
                   that prompt. For noninteractive use, set <code>ISOGATE_PROVIDER_CREDENTIAL</code>
                   in the environment instead.
                </p>
                 {providerCredential && (
                   <div className="mt-3 border border-[#2a3621] bg-[#090b08] p-2.5">
                     <div className="font-mono text-[9px] tracking-widest text-[#596252]">CREDENTIAL · BROWSER MEMORY ONLY</div>
                     <code className="mt-1 block break-all font-mono text-[11px] leading-relaxed text-[#e9ebdf]">{providerCredential}</code>
                   </div>
                 )}
                 {credentialNotice && <p className="mt-2 text-[#f6c453]" role="status">{credentialNotice}</p>}
                 <div className="mt-4 grid gap-3 border-t border-[#2a3621] pt-3 sm:grid-cols-2">
                   <div className="border border-[#2a3621] bg-[#090b08] p-3">
                     <div className="flex items-center justify-between gap-2">
                       <span className="font-mono text-[10px] tracking-widest text-[#c7d0bf]">WALLET OWNERSHIP</span>
                       <span className={walletBound ? 'font-mono text-[10px] text-[#d7ff32]' : 'font-mono text-[10px] text-[#f6c453]'}>
                         {walletBound ? 'BOUND' : 'NOT BOUND'}
                       </span>
                     </div>
                     <p className="mt-2 text-[10px] leading-relaxed text-[#596252]">
                       This signature proves control of the connected address for this provider; it is not a transaction.
                     </p>
                     {!walletBound && (
                       <button
                         type="button"
                         onClick={handleBindWallet}
                         disabled={!isReady || !walletAddress || createWalletChallenge.isPending || bindWallet.isPending}
                         className="mt-3 inline-flex min-h-8 items-center gap-2 border border-[#d7ff32] px-3 font-mono text-[9px] tracking-widest text-[#d7ff32] hover:bg-[#d7ff32] hover:text-[#0d0e0c] disabled:cursor-not-allowed disabled:opacity-50"
                       >
                         <WalletCards size={12} /> {createWalletChallenge.isPending || bindWallet.isPending ? 'SIGNING…' : 'BIND CONNECTED WALLET'}
                       </button>
                     )}
                     {walletActionError && <p className="mt-2 text-[10px] text-[#e49393]" role="alert">{walletActionError}</p>}
                   </div>
                   <div className="border border-[#2a3621] bg-[#090b08] p-3">
                     <div className="font-mono text-[10px] tracking-widest text-[#c7d0bf]">CREDENTIAL CONTROLS</div>
                     <div className="mt-3 flex flex-wrap gap-2">
                       <button
                         type="button"
                         onClick={handleRotateCredential}
                         disabled={rotateCredential.isPending || !providerCredential}
                         className="inline-flex min-h-8 items-center gap-1.5 border border-[#536345] px-2.5 font-mono text-[9px] tracking-widest text-[#d7ff32] hover:border-[#d7ff32] disabled:opacity-50"
                       >
                         <RotateCw size={12} /> {rotateCredential.isPending ? 'ROTATING…' : 'ROTATE'}
                       </button>
                       <button
                         type="button"
                         onClick={handleRevokeCredential}
                         disabled={revokeCredential.isPending || !providerCredential}
                         className="inline-flex min-h-8 items-center gap-1.5 border border-[#d26a6a]/60 px-2.5 font-mono text-[9px] tracking-widest text-[#e49393] hover:border-[#e49393] disabled:opacity-50"
                       >
                         <Trash2 size={12} /> {revokeCredential.isPending ? 'REVOKING…' : 'REVOKE'}
                       </button>
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 md:items-end">
            <div className="flex-1 min-w-0">
              <label className="block font-mono text-[10px] text-[#596252] tracking-widest mb-2">8-BYTE INPUT (HEX)</label>
              <div className="grid grid-cols-4 sm:flex gap-2">
                {inputs.map((val, idx) => (
                  <HexInput 
                    key={idx} 
                    index={idx}
                    value={val} 
                    onChange={(newVal) => {
                      const newInputs = [...inputs];
                      newInputs[idx] = newVal;
                      setInputs(newInputs);
                    }} 
                    disabled={replayCpu.isPending || !isReady}
                  />
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-48 shrink-0">
              <label className="block font-mono text-[10px] text-[#596252] tracking-widest mb-2 flex justify-between">
                <span>CYCLES</span>
                <span className="text-[#d7ff32]">{cycles}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="32" 
                value={cycles}
                onChange={(e) => setCycles(parseInt(e.target.value, 10))}
                disabled={replayCpu.isPending || !isReady}
                className="w-full h-1.5 bg-[#2a3621] rounded-full appearance-none outline-none cursor-pointer accent-[#d7ff32] disabled:opacity-50"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={replayCpu.isPending || runProviderJob.isPending || isAwaitingNative || !isReady || Boolean(provider && !walletBound)}
              className="h-[42px] px-6 w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] font-mono text-[11px] font-bold uppercase tracking-widest text-[#0d0e0c] transition-colors hover:bg-[#e4ff74] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replayCpu.isPending || runProviderJob.isPending || isAwaitingNative ? (
                <>
                  <Activity size={14} className="animate-spin" /> {isAwaitingNative ? 'AWAITING NATIVE NODE...' : 'EXECUTING...'}
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> {provider && !walletBound ? 'BIND WALLET FIRST' : provider ? 'RUN PROVIDER JOB' : 'SUBMIT REPLAY'}
                </>
              )}
            </button>
          </div>
          
          {replayCpu.isError && (
             <div role="alert" className="mt-4 border border-[#d26a6a]/30 bg-[#d26a6a]/10 p-3 text-xs text-[#e49393] flex items-center gap-2">
               <AlertCircle size={14} /> Replay failed: {getReplayErrorMessage(replayCpu.error)}
             </div>
          )}
          {runProviderJob.isError && (
             <div role="alert" className="mt-4 border border-[#d26a6a]/30 bg-[#d26a6a]/10 p-3 text-xs text-[#e49393] flex items-center gap-2">
               <AlertCircle size={14} /> Provider job failed: {getReplayErrorMessage(runProviderJob.error)}
             </div>
          )}
           {provider && !walletBound && (
             <div role="status" className="mt-4 border border-[#f6c453]/30 bg-[#f6c453]/10 p-3 text-xs text-[#d8d0a8] flex items-center gap-2">
               <WalletCards size={14} />
               Native job queue is disabled until this provider is bound to the connected wallet.
             </div>
           )}
          {isAwaitingNative && providerJob && (
            <div role="status" className="mt-4 border border-[#f6c453]/30 bg-[#f6c453]/10 p-3 text-xs text-[#d8d0a8] flex items-center gap-2">
              <Activity size={14} className="animate-spin" />
               <span>
                 Job {providerJob.id} is {providerJob.status}. Keep <code>isogate-node start</code> running on the registered device.
                 {providerJob.status === 'assigned' && (
                   <span className="mt-1 block font-mono text-[10px] text-[#c7d0bf]">
                     Lease expires {providerJob.leaseExpiresAt ? new Date(providerJob.leaseExpiresAt).toLocaleTimeString() : 'unknown'} · attempt {providerJob.attemptCount}.
                     {' '}If the lease expires, the job is automatically requeued for another attempt.
                   </span>
                 )}
                 {providerJob.status === 'queued' && (
                   <span className="mt-1 block font-mono text-[10px] text-[#c7d0bf]">
                     Attempt {providerJob.attemptCount}. A provider lease may expire and automatically requeue this job.
                   </span>
                 )}
               </span>
            </div>
          )}
           {credentialNotice && !provider && (
             <div role="status" className="mt-4 border border-[#f6c453]/30 bg-[#f6c453]/10 p-3 text-xs text-[#d8d0a8]">
               {credentialNotice}
             </div>
           )}
          {localError && (
            <div role="alert" className="mt-4 border border-[#d26a6a]/30 bg-[#d26a6a]/10 p-3 text-xs text-[#e49393] flex items-center gap-2">
              <AlertCircle size={14} /> {localError}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[#090b08] flex flex-col md:flex-row relative">
        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#090b08]/80 backdrop-blur-sm z-10">
            <div className="border border-[#f6c453]/25 bg-[#f6c453]/5 p-5 max-w-sm text-center shadow-xl">
              <AlertTriangle size={24} className="mx-auto text-[#f6c453] mb-3" />
              <h3 className="font-mono text-sm text-[#f6c453] mb-2 tracking-widest">WALLET REQUIRED</h3>
              <p className="text-xs text-[#d8d0a8] leading-relaxed">
                 Connect a wallet on Robinhood Chain to run the workload on this device and compare it with the backend replay.
              </p>
            </div>
          </div>
        ) : null}

        {result ? (
          <>
            <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#2a3621] bg-[#0d0e0c] overflow-y-auto md:h-full flex flex-col">
              <div className="p-5 border-b border-[#2a3621]">
                <h3 className="font-mono text-xs text-[#d7ff32] tracking-widest flex items-center gap-2 mb-4">
                  <Cpu size={14} /> LOCAL / SERVER AGREEMENT
                </h3>
                {providerJob?.status === 'completed' && providerJob.result && (
                  <a
                    href={`?page=proof-receipt&jobId=${encodeURIComponent(providerJob.id)}`}
                    className="mb-3 flex min-h-10 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-3 font-mono text-[10px] font-bold tracking-widest text-[#0d0e0c] hover:bg-[#e4ff74]"
                  >
                    <Link2 size={14} /> OPEN RECEIPT
                  </a>
                )}
                <div
                  className={`border p-3 ${digestsMatch ? 'border-[#d7ff32]/40 bg-[#d7ff32]/10' : 'border-[#d26a6a]/40 bg-[#d26a6a]/10'}`}
                  role="status"
                >
                  <div className={`font-mono text-sm font-bold tracking-widest ${digestsMatch ? 'text-[#d7ff32]' : 'text-[#e49393]'}`}>
                    {digestsMatch ? 'DIGEST MATCH' : 'DIGEST MISMATCH'}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#88917d]">
                    Browser Web Worker and Native Node executed the same bounded replay independently
                    {providerJob ? ` for recorded job ${providerJob.id}.` : '.'}
                  </p>
                </div>
                <dl className="mt-3 space-y-2 font-mono text-[10px] text-[#596252]">
                  <div className="flex justify-between gap-4"><dt>LOCAL WORKER</dt><dd className="text-[#c7d0bf]">{localReplay?.durationMs.toFixed(2)} MS</dd></div>
                  <div className="flex justify-between gap-4"><dt>LOGICAL PROCESSORS</dt><dd className="text-[#c7d0bf]">{logicalProcessors}</dd></div>
                  <div className="flex justify-between gap-4"><dt>DEVICE MEMORY</dt><dd className="text-[#c7d0bf]">{deviceMemory ? `${deviceMemory} GB` : 'NOT EXPOSED'}</dd></div>
                </dl>
              </div>

              <div className="p-5 border-b border-[#2a3621]">
                <h3 className="font-mono text-xs text-[#d7ff32] tracking-widest flex items-center gap-2 mb-4">
                  <ShieldCheck size={14} /> REPLAY DIGEST
                </h3>
                <div className="bg-[#11150e] border border-[#2a3621] p-3 rounded-sm">
                  <div className="font-mono text-[10px] text-[#596252] mb-1">{result.digestAlgorithm}</div>
                  <div className="font-mono text-xs text-[#e9ebdf] break-all leading-relaxed">
                    {result.digest}
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-b border-[#2a3621]">
                <h3 className="font-mono text-xs text-[#d7ff32] tracking-widest flex items-center gap-2 mb-4">
                  <Hash size={14} /> OUTPUT BUFFER
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {result.outputs.map((out, idx) => (
                    <div key={idx} className="bg-[#11150e] border border-[#2a3621] py-2 text-center flex flex-col gap-1">
                      <span className="font-mono text-[9px] text-[#596252]">OUT {idx}</span>
                      <span className="font-mono text-xs text-[#e9ebdf]">{out.toString(16).padStart(2, '0').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 pb-8">
                <h3 className="font-mono text-xs text-[#d7ff32] tracking-widest flex items-center gap-2 mb-4">
                  <Activity size={14} /> FINAL STATE
                </h3>
                <div className="space-y-3">
                  <StateRow label="CYCLE" value={result.finalState.cycle.toString()} />
                  <StateRow label="PC" value={`0x${result.finalState.pc.toString(16).padStart(4, '0').toUpperCase()}`} />
                  <StateRow label="ACCUMULATOR" value={`0x${result.finalState.accumulator.toString(16).padStart(2, '0').toUpperCase()}`} />
                  <StateRow label="RAM" value={`0x${result.finalState.ram.toString(16).padStart(2, '0').toUpperCase()}`} />
                  <StateRow label="ZERO FLAG" value={result.finalState.zero ? '1' : '0'} />
                  <StateRow label="CARRY FLAG" value={result.finalState.carry ? '1' : '0'} />
                  <StateRow label="HALTED" value={result.finalState.halted ? 'TRUE' : 'FALSE'} />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-w-0 bg-[#090b08] md:h-full">
              <div className="shrink-0 p-3 border-b border-[#2a3621] bg-[#0d0e0c] flex items-center gap-2">
                <LayoutGrid size={14} className="text-[#d7ff32]" />
                 <span className="font-mono text-[10px] text-[#d7ff32] tracking-widest uppercase">SERVER EXECUTION TRACE ({result.trace.length} FRAMES)</span>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-5">
                <TraceGrid trace={result.trace} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#596252] p-8 text-center min-h-[300px]">
            <Activity size={48} className="mb-4 opacity-20" />
            <h3 className="font-mono text-sm tracking-widest text-[#88917d] mb-2">AWAITING REPLAY TASK</h3>
            <p className="max-w-sm text-xs leading-relaxed">
              Connect your wallet on Robinhood Chain, configure input parameters, then execute the workload on your browser CPU and the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getReplayErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error;
    }
  }
  return 'The replay service did not complete the request. Check API status and try again.';
}
