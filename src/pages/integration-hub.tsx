import { useHealthCheck } from '@api-client';
import {
  Activity,
  Bot,
  CheckCircle2,
  Code,
  Cpu,
  FileJson,
  Globe,
  KeyRound,
  Link as LinkIcon,
  LockKeyhole,
  Server,
  XCircle,
} from 'lucide-react';

const publicEndpoints = [
  { method: 'GET', path: '/api/healthz', detail: 'Check whether the API is online.' },
  { method: 'POST', path: '/api/replays', detail: 'Run one bounded deterministic CPU replay with exactly eight bytes.' },
  { method: 'GET', path: '/api/network/summary', detail: 'Read aggregate public network counts.' },
  { method: 'GET', path: '/api/network/providers', detail: 'Read public provider records.' },
  { method: 'GET', path: '/api/network/jobs', detail: 'Read redacted completed or rejected jobs.' },
  { method: 'GET', path: '/api/receipts/{jobId}', detail: 'Read the server verification receipt for a completed job.' },
];

const privateFlows = [
  {
    icon: Bot,
    title: 'External Agent integration',
    audience: 'For developers running their own Agent service',
    steps: [
      'Register the Agent once with POST /api/agents.',
      'Save the one-time Agent credential securely.',
      'Bind the human owner wallet on Robinhood Chain.',
      'Set the bounded CPU replay policy.',
      'Submit jobs with X-Isogate-Agent-Credential.',
    ],
  },
  {
    icon: Cpu,
    title: 'Native Node provider',
    audience: 'For operators contributing a machine',
    steps: [
      'Register a real Native Node CPU report with POST /api/providers.',
      'Save the one-time provider credential securely.',
      'Bind the provider owner wallet.',
      'Send heartbeats, claim jobs, and return deterministic results.',
      'Authenticate with X-Isogate-Provider-Credential.',
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  const isGet = method === 'GET';
  return (
    <span className={`w-12 shrink-0 px-2 py-1 text-center font-mono text-[10px] font-bold ${
      isGet ? 'bg-blue-500/10 text-blue-400' : 'bg-[#d7ff32]/10 text-[#d7ff32]'
    }`}>
      {method}
    </span>
  );
}

export function IntegrationHubPage() {
  const { data: health, isLoading, isError } = useHealthCheck();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://isogate.network';

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Integration Hub</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">
            API guide for external developers
          </p>
        </div>
        <span className="w-fit border border-[#d7ff32]/35 bg-[#d7ff32]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
          Developer access
        </span>
      </header>

      <section className="grid gap-4 lg:grid-cols-2" aria-labelledby="integration-purpose-heading">
        <div className="border border-[#d7ff32]/30 bg-[#0b0e09] p-6 sm:p-8">
          <Code size={20} className="text-[#d7ff32]" aria-hidden="true" />
          <h2 id="integration-purpose-heading" className="mt-5 text-xl font-semibold text-[#efffca]">
            What this page is for
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#aab3a2]">
            Integration Hub is documentation for developers connecting external software to Isogate. Use it to
            discover the REST API, test deterministic replay, build an Agent client, or operate a Native Node.
            It is not a wallet dashboard, marketplace, or hosted AI-agent builder.
          </p>
        </div>
        <div className="border border-[#2a3621] bg-[#090b08] p-6 sm:p-8">
          <LockKeyhole size={20} className="text-[#f6c453]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold text-[#efffca]">Public and private access</h2>
          <p className="mt-3 text-sm leading-6 text-[#88917d]">
            Public endpoints expose health, bounded replay, and redacted network records without a wallet.
            Agent and provider control endpoints require separate one-time service credentials. Wallet signatures
            prove owner control but are not API credentials and do not grant spending authority.
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="border border-[#2a3621] bg-[#090b08]">
            <div className="border-b border-[#2a3621] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Globe size={17} className="text-[#d7ff32]" aria-hidden="true" />
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">Public API directory</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#88917d]">
                These routes require no Agent or provider credential. Network responses are intentionally redacted.
              </p>
            </div>
            <div className="divide-y divide-[#2a3621]">
              {publicEndpoints.map((endpoint) => (
                <div key={`${endpoint.method}-${endpoint.path}`} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-8">
                  <div className="flex min-w-0 items-center gap-3 sm:w-[48%]">
                    <MethodBadge method={endpoint.method} />
                    <code className="min-w-0 break-all font-mono text-xs text-[#efffca]">{endpoint.path}</code>
                  </div>
                  <p className="text-xs leading-5 text-[#687360] sm:flex-1">{endpoint.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="private-integration-heading">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <KeyRound size={17} className="text-[#f6c453]" aria-hidden="true" />
                <h2 id="private-integration-heading" className="font-mono text-xs uppercase tracking-widest text-[#f6c453]">
                  Authenticated integration flows
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#88917d]">
                Credentials are returned once, stored server-side only as hashes, and must never be placed in
                frontend source, URLs, logs, or public repositories.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {privateFlows.map(({ icon: Icon, title, audience, steps }) => (
                <article key={title} className="border border-[#2a3621] bg-[#090b08] p-6">
                  <Icon size={19} className="text-[#d7ff32]" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold text-[#efffca]">{title}</h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#687360]">{audience}</p>
                  <ol className="mt-5 space-y-3">
                    {steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-6 text-[#88917d]">
                        <span className="font-mono text-[10px] text-[#d7ff32]">{String(index + 1).padStart(2, '0')}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-[#2a3621] bg-[#090b08] p-6 sm:p-8" aria-labelledby="replay-example-heading">
            <h2 id="replay-example-heading" className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
              Public replay example
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#88917d]">
              This executes the built-in deterministic CPU replay only. It does not queue a provider job or create a blockchain proof.
            </p>
            <pre className="mt-5 overflow-x-auto border border-[#35412c] bg-[#11150e] p-4 font-mono text-xs leading-6 text-[#c7d0bf]">
              <code>{`curl -X POST ${baseUrl}/api/replays \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"inputs\":[66,23,0,1,168,60,16,255],\"cycles\":32}'`}</code>
            </pre>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-[#2a3621] bg-[#090b08] p-6">
            <div className="flex items-center gap-3">
              <Server size={15} className="text-[#88917d]" aria-hidden="true" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#efffca]">API status</h2>
            </div>
            <dl className="mt-6 space-y-4">
              <div className="border-b border-[#2a3621] pb-4">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-[#596252]">Base URL</dt>
                <dd className="mt-2 break-all font-mono text-[10px] text-[#c7d0bf]">{baseUrl}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-[#596252]">Health</dt>
                <dd className="flex items-center gap-2">
                  {isLoading ? (
                    <><Activity className="animate-spin text-[#596252]" size={14} /><span className="font-mono text-[10px] text-[#596252]">CHECKING</span></>
                  ) : isError ? (
                    <><XCircle className="text-red-400" size={14} /><span className="font-mono text-[10px] text-red-400">OFFLINE</span></>
                  ) : (
                    <><CheckCircle2 className="text-[#d7ff32]" size={14} /><span className="font-mono text-[10px] text-[#d7ff32]">{health?.status || 'ONLINE'}</span></>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-[#2a3621] bg-[#090b08] p-6">
            <div className="flex items-center gap-3">
              <FileJson size={15} className="text-[#88917d]" aria-hidden="true" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#efffca]">Complete reference</h2>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#687360]">
              Swagger documents request bodies, response schemas, credential headers, and error codes for every active endpoint.
            </p>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex min-h-11 items-center justify-between border border-[#35412c] bg-[#11150e] px-4 font-mono text-xs text-[#efffca] transition-colors hover:border-[#d7ff32] hover:text-[#d7ff32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff32]"
            >
              Open API Reference
              <LinkIcon size={14} aria-hidden="true" />
            </a>
          </section>

          <section className="border border-[#35412c] bg-[#11150e] p-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#596252]">MCP server</h2>
            <p className="mt-3 text-xs leading-5 text-[#88917d]">
              No public MCP server is available. Integration currently uses the documented REST API only.
            </p>
            <span className="mt-4 inline-flex border border-[#35412c] bg-[#090b08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[#596252]">
              Coming soon
            </span>
          </section>
        </aside>
      </div>
    </div>
  );
}