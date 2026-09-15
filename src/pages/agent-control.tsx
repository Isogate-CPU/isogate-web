import { useState, useEffect } from 'react';
import { Terminal, Key, Activity, ShieldCheck, ArrowRight, Code, Copy, Settings2, WalletCards, RefreshCw, PowerOff, ShieldAlert, Cpu } from 'lucide-react';
import {
  useRegisterAgent,
  useGetAgent,
  useCreateAgentWalletChallenge,
  useBindAgentWallet,
  useUpdateAgentPolicy,
  useSubmitAgentJob,
  useRotateAgentCredential,
  useRevokeAgentCredential,
  useListNetworkProviders,
  useListAgentEvents,
  getListAgentEventsQueryKey,
  getGetAgentQueryKey
} from '@api-client';
import { useConsoleAccess } from '../components/wallet-access';
import { useSignMessage } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';

export function AgentControlPage({ walletEnabled = true }: { walletEnabled?: boolean }) {
  const [sessionAgentId, setSessionAgentId] = useState('');
  const [sessionCredential, setSessionCredential] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <AgentAuth
        onLogin={(id, cred) => { setSessionAgentId(id); setSessionCredential(cred); setIsAuthenticated(true); }}
      />
    );
  }

  return (
    <AgentDashboard
      agentId={sessionAgentId}
      credential={sessionCredential}
      onLogout={() => { setSessionAgentId(''); setSessionCredential(''); setIsAuthenticated(false); }}
      onCredentialUpdated={(newCred) => setSessionCredential(newCred)}
      walletEnabled={walletEnabled}
    />
  );
}

// Will define AgentAuth and AgentDashboard components next

function CopyButton({ value }: { value: string }) {
  const [feedback, setFeedback] = useState('');
  const copy = async () => {
    setFeedback('');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(value);
      setFeedback('COPIED');
    } catch {
      setFeedback('FAILED');
    }
  };
  return (
    <span className="inline-flex shrink-0 flex-col items-end gap-1">
      <button type="button" onClick={copy} className="inline-flex min-h-8 items-center gap-1.5 border border-[#536345] px-2.5 font-mono text-[9px] tracking-widest text-[#d7ff32] hover:border-[#d7ff32]">
        <Copy size={12} /> COPY
      </button>
      {feedback && <span className={feedback === 'COPIED' ? 'text-[9px] text-[#d7ff32]' : 'text-[9px] text-[#e49393]'}>{feedback}</span>}
    </span>
  );
}

function AgentAuth({ onLogin }: { onLogin: (id: string, cred: string) => void }) {
  const [mode, setMode] = useState<'intro' | 'register' | 'resume'>('intro');
  const [regName, setRegName] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const registerAgent = useRegisterAgent();
  const [newAgent, setNewAgent] = useState<{id: string, credential: string} | null>(null);

  const [loginId, setLoginId] = useState('');
  const [loginCred, setLoginCred] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) return;
    try {
      const res = await registerAgent.mutateAsync({ data: { name: regName, description: regDesc || undefined } });
      setNewAgent({ id: res.agent.id, credential: res.credential });
      setRegName(''); setRegDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId && loginCred) {
      onLogin(loginId, loginCred);
    }
  };

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Agent Integration</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">External agent control surface</p>
        </div>
        <span className="border border-[#35412c]/50 bg-[#35412c]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#c7d0bf]">
          Control
        </span>
      </header>

      {mode === 'intro' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-6 flex items-center gap-3">
                <Terminal size={16} /> New Integration
              </h2>
              <p className="text-sm text-[#88917d] leading-relaxed mb-6">
                Register a new user-owned external agent. The agent must connect via this API to submit bounded deterministic CPU replay jobs.
              </p>
            </div>
            <button onClick={() => setMode('register')} className="inline-flex items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32]/5 px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#090b08] w-full mt-8">
              Register Agent <ArrowRight size={14} />
            </button>
          </section>

          <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-6 flex items-center gap-3">
                <Key size={16} /> Resume Integration
              </h2>
              <p className="text-sm text-[#88917d] leading-relaxed mb-6">
                Provide your Agent ID and credential to manage policy, bind wallets, and monitor execution. Credentials are kept in browser memory only.
              </p>
            </div>
            <button onClick={() => setMode('resume')} className="inline-flex items-center justify-center gap-2 border border-[#2a3621] bg-[#11150e] px-6 py-4 font-mono text-xs uppercase tracking-widest text-[#c7d0bf] transition-colors hover:border-[#d7ff32] hover:text-[#d7ff32] w-full mt-8">
              Enter Credentials <ArrowRight size={14} />
            </button>
          </section>

          <div className="lg:col-span-2 border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-6 flex items-center gap-3">
              <ShieldAlert size={16} /> Architectural Boundaries
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#efffca]">1. External Agent Only</h3>
                <p className="text-xs text-[#88917d] leading-relaxed">
                  Isogate does not host AI agents. The agent runs on your infrastructure and submits jobs to the network.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#efffca]">2. Provider Wallet Bind</h3>
                <p className="text-xs text-[#88917d] leading-relaxed">
                  The connected wallet belongs to the human operator/provider. It proves ownership but does not grant the agent autonomous spending authority.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#efffca]">3. Deterministic execution</h3>
                <p className="text-xs text-[#88917d] leading-relaxed">
                  Agents can only submit bounded deterministic cpu_replay workloads which generate a canonical server verification receipt. No arbitrary code execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'register' && (
        <div className="max-w-2xl mx-auto border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a3621]">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#d7ff32] flex items-center gap-3">
              <Terminal size={16} /> Register Agent
            </h2>
            <button onClick={() => {setMode('intro'); setNewAgent(null);}} className="font-mono text-[10px] text-[#596252] hover:text-[#d7ff32] uppercase tracking-widest">
              Cancel
            </button>
          </div>

          {!newAgent ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="regName" className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Agent Name</label>
                <input id="regName" type="text" value={regName} onChange={e => setRegName(e.target.value)} required disabled={registerAgent.isPending}
                  className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-4 py-3 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
                  placeholder="e.g. My Integration"
                />
              </div>
              <div>
                <label htmlFor="regDesc" className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Description (Optional)</label>
                <input id="regDesc" type="text" value={regDesc} onChange={e => setRegDesc(e.target.value)} disabled={registerAgent.isPending}
                  className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-4 py-3 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
                  placeholder="Purpose of this integration"
                />
              </div>

              {registerAgent.isError && (
                <div className="text-[#e49393] text-xs font-mono p-3 border border-[#e49393]/30 bg-[#e49393]/10">Registration failed.</div>
              )}

              <button type="submit" disabled={registerAgent.isPending || !regName} className="inline-flex w-full min-h-12 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32]/5 px-6 font-mono text-xs font-bold uppercase tracking-widest text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c] disabled:opacity-50">
                {registerAgent.isPending ? 'Registering...' : 'Register'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="border border-[#f6c453] bg-[#f6c453]/10 p-4">
                <h3 className="font-mono text-xs text-[#f6c453] uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Save Credentials Now</h3>
                <p className="text-xs text-[#d8d0a8] leading-relaxed">
                  This credential will never be shown again. Isogate does not store this credential in plaintext.
                  Keep it secure.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-1">Agent ID</div>
                  <div className="flex items-center justify-between gap-3 border border-[#2a3621] bg-[#11150e] p-3">
                    <code className="text-xs text-[#efffca] break-all font-mono">{newAgent.id}</code>
                    <CopyButton value={newAgent.id} />
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-1">Credential</div>
                  <div className="flex items-center justify-between gap-3 border border-[#d7ff32]/30 bg-[#11150e] p-3">
                    <code className="text-xs text-[#d7ff32] break-all font-mono">{newAgent.credential}</code>
                    <CopyButton value={newAgent.credential} />
                  </div>
                </div>
              </div>

              <button onClick={() => onLogin(newAgent.id, newAgent.credential)} className="inline-flex w-full min-h-12 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-6 font-mono text-xs font-bold uppercase tracking-widest text-[#0d0e0c] transition-colors hover:bg-[#efffca]">
                Enter Dashboard <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'resume' && (
        <div className="max-w-xl mx-auto border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a3621]">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#d7ff32] flex items-center gap-3">
              <Key size={16} /> Resume Integration
            </h2>
            <button onClick={() => setMode('intro')} className="font-mono text-[10px] text-[#596252] hover:text-[#d7ff32] uppercase tracking-widest">
              Cancel
            </button>
          </div>

          <form onSubmit={handleResume} className="space-y-6">
            <div>
              <label htmlFor="loginId" className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Agent ID</label>
              <input id="loginId" type="password" value={loginId} onChange={e => setLoginId(e.target.value)} required
                className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-4 py-3 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="loginCred" className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Credential</label>
              <input id="loginCred" type="password" value={loginCred} onChange={e => setLoginCred(e.target.value)} required
                className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-4 py-3 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
              />
            </div>

            <p className="text-[10px] text-[#596252] font-mono leading-relaxed">
              Credentials are held in browser memory only and never stored in localStorage or cookies.
            </p>

            <button type="submit" disabled={!loginId || !loginCred} className="inline-flex w-full min-h-12 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32]/5 px-6 font-mono text-xs font-bold uppercase tracking-widest text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c] disabled:opacity-50">
              Access Dashboard
            </button>
          </form>
        </div>
      )}
    </div>
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

function AgentDashboard({ agentId, credential, onLogout, onCredentialUpdated, walletEnabled }: { agentId: string, credential: string, onLogout: () => void, onCredentialUpdated: (c: string) => void, walletEnabled: boolean }) {
  const queryClient = useQueryClient();
  const requestOpts = { headers: { 'x-isogate-agent-credential': credential } };

  const { data: agent, isLoading, isError, error } = useGetAgent(agentId, {
    request: requestOpts,
    query: { queryKey: getGetAgentQueryKey(agentId), retry: false }
  });

  const { data: events } = useListAgentEvents(agentId, {
    request: requestOpts,
    query: { queryKey: getListAgentEventsQueryKey(agentId), refetchInterval: 5000 }
  });

  const { data: providers } = useListNetworkProviders({
    query: { queryKey: ['network-providers'] }
  });

  const updatePolicy = useUpdateAgentPolicy({ request: requestOpts });
  const rotateCred = useRotateAgentCredential({ request: requestOpts });
  const revokeCred = useRevokeAgentCredential({ request: requestOpts });

  const createChallenge = useCreateAgentWalletChallenge({ request: requestOpts });
  const bindWallet = useBindAgentWallet({ request: requestOpts });
  const submitJob = useSubmitAgentJob({ request: requestOpts });

  const { signMessageAsync } = useSignMessage();
  const access = useConsoleAccess();

  const [polEnabled, setPolEnabled] = useState(false);
  const [polMaxCycles, setPolMaxCycles] = useState(32);
  const [newCredResult, setNewCredResult] = useState('');

  // Job submit state
  const [selProvider, setSelProvider] = useState('');
  const [jobInputs, setJobInputs] = useState<string[]>(['00', '00', '00', '00', '00', '00', '00', '00']);
  const [jobCycles, setJobCycles] = useState(32);
  const [jobResult, setJobResult] = useState<{ id: string, status: string } | null>(null);
  const [jobError, setJobError] = useState('');
  const [bindError, setBindError] = useState('');

  useEffect(() => {
    if (agent && !updatePolicy.isPending) {
      setPolEnabled(agent.policy.enabled);
      setPolMaxCycles(agent.policy.maxCycles);
    }
  }, [agent]);

  const handleUpdatePolicy = async () => {
    try {
      await updatePolicy.mutateAsync({
        agentId,
        data: {
          enabled: polEnabled,
          maxCycles: polMaxCycles,
          maxInputs: 8,
          operation: 'cpu_replay',
          expiresAt: null
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetAgentQueryKey(agentId) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBind = async () => {
    if (!walletEnabled || !access.isReady || !access.address || !signMessageAsync) {
      setBindError('Connect a wallet on Robinhood Chain first.');
      return;
    }
    setBindError('');
    try {
      const challenge = await createChallenge.mutateAsync({ agentId, data: { walletAddress: access.address } });
      const signature = await signMessageAsync({ message: challenge.message });
      await bindWallet.mutateAsync({ agentId, data: { walletAddress: access.address, message: challenge.message, signature } });
      queryClient.invalidateQueries({ queryKey: getGetAgentQueryKey(agentId) });
    } catch (e: any) {
      setBindError(e.message || 'Binding failed');
    }
  };

  const handleJob = async () => {
    setJobError('');
    setJobResult(null);
    if (!selProvider) { setJobError('Select a provider'); return; }

    const parsed = jobInputs.map(hex => parseInt(hex, 16) || 0);
    try {
      const res = await submitJob.mutateAsync({
        agentId,
        data: {
          providerId: selProvider,
          cycles: jobCycles,
          inputs: parsed
        }
      });
      setJobResult({ id: res.id, status: res.status });
    } catch(e: any) {
      setJobError(e.message || 'Job submission failed');
    }
  };

  const handleRotate = async () => {
    if(!window.confirm('Rotate credential? The old one will invalidate immediately.')) return;
    try {
      const res = await rotateCred.mutateAsync({ agentId });
      setNewCredResult(res.credential);
      onCredentialUpdated(res.credential);
    } catch(e) {
      console.error(e);
    }
  };

  const handleRevoke = async () => {
    if(!window.confirm('Revoke credential? You will lose access to manage this agent completely.')) return;
    try {
      await revokeCred.mutateAsync({ agentId });
      onLogout();
    } catch(e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center text-[#596252] font-mono text-sm uppercase">Loading Agent...</div>;
  }

  if (isError) {
    return (
      <div className="section-shell flex-1 py-12 lg:py-20">
        <div className="border border-red-500/30 bg-red-500/10 p-6 max-w-2xl mx-auto text-center">
          <ShieldAlert className="text-red-400 mx-auto mb-4" size={32} />
          <h2 className="text-red-400 font-mono text-sm uppercase tracking-widest mb-4">Authentication Failed</h2>
          <p className="text-red-400/80 text-xs mb-8">The credential provided is invalid or the agent does not exist.</p>
          <button onClick={onLogout} className="border border-red-400 px-6 py-3 font-mono text-xs uppercase text-red-400 hover:bg-red-400/10 transition-colors">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-4xl truncate">{agent.name}</h1>
          <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-[#596252]">
            <span className="flex items-center gap-2 text-[#88917d]"><Terminal size={14}/> ID: {agent.id.substring(0,8)}...</span>
            <span className={`px-2 py-0.5 ${agent.status === 'active' ? 'bg-[#d7ff32]/10 text-[#d7ff32]' : 'bg-[#2a3621] text-[#596252]'}`}>
              {agent.status}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 border border-[#2a3621] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#88917d] hover:border-[#e49393] hover:text-[#e49393] transition-colors">
          <PowerOff size={12}/> Logout Session
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">

          {/* Policy */}
          <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] flex items-center gap-3">
                <Settings2 size={16} /> Agent Policy
              </h2>
              <div className="text-[10px] text-[#596252] font-mono tracking-widest text-right">
                <div>v{agent.policyVersion}</div>
                <div>{agent.policyHash.substring(0,8)}</div>
              </div>
            </div>

            <p className="text-[#88917d] text-xs leading-relaxed mb-6 font-mono">
              The policy acts as a server-enforced boundary. Any job submitted by this agent that exceeds these limits will be immediately rejected.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <div>
                <label className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Status</label>
                <select value={polEnabled ? 'true' : 'false'} onChange={e => setPolEnabled(e.target.value === 'true')}
                  className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-3 py-2 outline-none focus:border-[#d7ff32]">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Max Cycles</label>
                <input type="number" min="1" max="32" value={polMaxCycles} onChange={e => setPolMaxCycles(parseInt(e.target.value)||1)}
                  className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-3 py-2 outline-none focus:border-[#d7ff32]" />
              </div>
              <div>
                <span className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Input Width</span>
                <div className="border border-[#2a3621] bg-[#11150e] px-3 py-2 font-mono text-sm text-[#efffca]">8 bytes fixed by CPU replay</div>
              </div>
            </div>

            <button onClick={handleUpdatePolicy} disabled={updatePolicy.isPending} className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#d7ff32] px-6 font-mono text-[10px] font-bold uppercase tracking-widest text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c] disabled:opacity-50">
              {updatePolicy.isPending ? 'Updating...' : 'Update Policy'}
            </button>
          </section>

          {/* Job Submission */}
          <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-6 flex items-center gap-3">
              <Cpu size={16} /> Submit Job
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Target Provider</label>
                <select value={selProvider} onChange={e => setSelProvider(e.target.value)}
                  className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-3 py-3 outline-none focus:border-[#d7ff32]">
                  <option value="">Select a wallet-bound provider...</option>
                  {providers?.filter(p => p.walletBoundAt).map(p => (
                    <option key={p.id} value={p.id}>{p.id.substring(0,16)}... ({p.cpuModel})</option>
                  ))}
                </select>
                <div className="mt-2 text-right">
                  <a href="?page=provider" className="text-[10px] text-[#88917d] font-mono hover:text-[#d7ff32] underline">View Provider Network</a>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Inputs (exactly 8 bytes)</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <HexInput key={i} index={i} value={jobInputs[i] || '00'} onChange={v => {
                      const newInputs = [...jobInputs];
                      newInputs[i] = v;
                      setJobInputs(newInputs);
                    }} disabled={submitJob.isPending} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#596252] uppercase tracking-widest mb-2">Cycles (Max {polMaxCycles})</label>
                <input type="number" min="1" max={polMaxCycles} value={jobCycles} onChange={e => setJobCycles(parseInt(e.target.value)||1)} disabled={submitJob.isPending}
                  className="w-full md:w-48 bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm px-3 py-2 outline-none focus:border-[#d7ff32]" />
              </div>

              {jobError && <div className="text-[#e49393] text-xs font-mono p-3 border border-[#e49393]/30 bg-[#e49393]/10">{jobError}</div>}
              {jobResult && (
                <div className="border border-[#d7ff32]/30 bg-[#d7ff32]/5 p-4 space-y-3">
                  <div className="font-mono text-[10px] text-[#d7ff32] uppercase tracking-widest">Job Submitted Successfully</div>
                  <div className="flex items-center justify-between bg-[#090b08] border border-[#2a3621] p-2">
                    <code className="text-xs text-[#efffca] font-mono">{jobResult.id}</code>
                    <CopyButton value={jobResult.id} />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <a href={`?page=proof-receipt&jobId=${jobResult.id}`} className="text-[10px] text-[#d7ff32] font-mono hover:underline uppercase tracking-widest flex items-center gap-1">
                      Check Verification Receipt <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              )}

              <button onClick={handleJob} disabled={submitJob.isPending || !agent.policy.enabled} className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-8 font-mono text-[10px] font-bold uppercase tracking-widest text-[#0d0e0c] transition-colors hover:bg-[#efffca] disabled:opacity-50">
                {submitJob.isPending ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
          </section>

          {/* Events */}
          <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] flex items-center gap-3">
                <Activity size={16} /> Audit Events
              </h2>
            </div>

            <div className="space-y-3">
              {events?.length ? events.map(ev => (
                <div key={ev.id} className="border border-[#2a3621] bg-[#11150e] p-4 font-mono">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#efffca] uppercase tracking-widest">{ev.type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-[#596252]">{new Date(ev.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-[#88917d] truncate">ID: {ev.id}</div>
                  {ev.providerJobId && (
                    <div className="mt-2 text-[10px]">
                      <a href={`?page=proof-receipt&jobId=${ev.providerJobId}`} className="text-[#d7ff32] hover:underline flex items-center gap-1">Job: {ev.providerJobId.substring(0,8)}... <ArrowRight size={10}/></a>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center p-8 border border-[#2a3621] text-[#596252] text-xs font-mono uppercase tracking-widest">
                  No events recorded
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Wallet Binding */}
          <section className="border border-[#2a3621] bg-[#090b08] p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#efffca] mb-4 flex items-center gap-2">
              <WalletCards size={14} className="text-[#88917d]" /> Operator Wallet
            </h2>
            <div className="mb-4 text-xs text-[#88917d] leading-relaxed">
              Agents require a human operator. Binding a wallet proves ownership; it does not grant the agent spending ability.
            </div>

            {agent.ownerWalletAddress ? (
              <div className="border border-[#d7ff32]/30 bg-[#d7ff32]/5 p-3 font-mono text-[10px]">
                <div className="text-[#d7ff32] mb-1">BOUND WALLET</div>
                <div className="text-[#efffca] break-all">{agent.ownerWalletAddress}</div>
                <div className="text-[#596252] mt-2">Bound: {new Date(agent.ownerWalletBoundAt!).toLocaleDateString()}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-[#f6c453]/30 bg-[#f6c453]/5 p-3 font-mono text-[10px] text-[#d8d0a8]">
                  Not bound. Agent is restricted.
                </div>
                <button onClick={handleBind} disabled={bindWallet.isPending || createChallenge.isPending} className="w-full inline-flex min-h-10 items-center justify-center gap-2 border border-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c] disabled:opacity-50">
                  {bindWallet.isPending || createChallenge.isPending ? 'Binding...' : 'Bind Connected Wallet'}
                </button>
                {bindError && <div className="text-[#e49393] text-[10px] font-mono">{bindError}</div>}
              </div>
            )}
          </section>

          {/* Security */}
          <section className="border border-[#2a3621] bg-[#090b08] p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#efffca] mb-4 flex items-center gap-2">
              <Key size={14} className="text-[#88917d]" /> Credential Security
            </h2>

            {newCredResult && (
              <div className="border border-[#f6c453] bg-[#f6c453]/10 p-4 mb-6">
                <h3 className="font-mono text-[10px] text-[#f6c453] uppercase tracking-widest mb-2">New Credential</h3>
                <div className="flex items-center justify-between bg-[#090b08] border border-[#f6c453]/50 p-2 mb-2">
                  <code className="text-xs text-[#efffca] font-mono break-all">{newCredResult}</code>
                  <CopyButton value={newCredResult} />
                </div>
                <p className="text-[10px] text-[#d8d0a8] font-mono">Session updated automatically. Save this now.</p>
              </div>
            )}

            <div className="space-y-3">
              <button onClick={handleRotate} disabled={rotateCred.isPending} className="w-full inline-flex min-h-10 items-center justify-between gap-2 border border-[#2a3621] bg-[#11150e] px-4 font-mono text-[10px] uppercase tracking-widest text-[#c7d0bf] transition-colors hover:border-[#f6c453] hover:text-[#f6c453] disabled:opacity-50">
                <span>Rotate Credential</span>
                <RefreshCw size={12} />
              </button>

              <button onClick={handleRevoke} disabled={revokeCred.isPending} className="w-full inline-flex min-h-10 items-center justify-between gap-2 border border-[#2a3621] bg-[#11150e] px-4 font-mono text-[10px] uppercase tracking-widest text-red-400 transition-colors hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50">
                <span>Revoke Access</span>
                <ShieldAlert size={12} />
              </button>
            </div>
          </section>

          <div className="border border-[#2a3621] bg-[#090b08] p-5">
            <a href="?page=integration-hub" className="inline-flex w-full min-h-10 items-center justify-center gap-2 bg-[#11150e] px-4 font-mono text-[10px] uppercase tracking-widest text-[#88917d] transition-colors hover:text-[#efffca]">
              <Code size={12} /> Integration Hub SDKs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
