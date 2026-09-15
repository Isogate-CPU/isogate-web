import { useState } from 'react';
import {
  useListNetworkProviders,
  useListNetworkJobs,
  useGetNetworkSummary,
  getGetNetworkSummaryQueryKey,
  getListNetworkProvidersQueryKey,
  getListNetworkJobsQueryKey
} from '@api-client';
import { Server, Activity, Hash, Search, AlertCircle, Cpu, ArrowRight, Terminal, Info, ShieldCheck, Box } from 'lucide-react';

export function ProviderPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: summary, isLoading: isLoadingSummary } = useGetNetworkSummary({
    query: { refetchInterval: 5000, queryKey: getGetNetworkSummaryQueryKey() }
  });
  const { data: providers, isLoading: isLoadingProviders, isError: isErrorProviders } = useListNetworkProviders({
    query: { refetchInterval: 5000, queryKey: getListNetworkProvidersQueryKey() }
  });
  const { data: jobs, isLoading: isLoadingJobs } = useListNetworkJobs(undefined, {
    query: { refetchInterval: 5000, queryKey: getListNetworkJobsQueryKey() }
  });

  const filteredProviders = providers?.filter(p => p.id.includes(searchTerm) || p.cpuModel.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Provider Network</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">Deterministic Compute Beta</p>
        </div>
        <span className="border border-[#d7ff32]/35 bg-[#d7ff32]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
          Live beta
        </span>
      </header>

      <div className="mb-12 grid gap-6 lg:grid-cols-2">
        <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center bg-[#d7ff32]/10 text-[#d7ff32]">
                <Server size={20} />
              </div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-[#f1f3e8]">What is a Provider?</h2>
            </div>
            <p className="text-[#88917d] leading-relaxed mb-6">
              Isogate is a deterministic compute technical beta for users who want to turn a real computer into a bounded Native Node provider, with the server independently recomputing every result.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 border border-[#2a3621] bg-[#11150e] p-4">
                <Terminal size={16} className="text-[#d7ff32] mt-0.5 shrink-0" />
                <p className="text-xs text-[#efffca] leading-relaxed">
                  A browser simulation is <strong className="text-[#d7ff32] font-normal">not</strong> a provider. To participate, you must install and run a Native Node on your device.
                </p>
              </div>
              <div className="flex items-start gap-3 border border-[#2a3621] bg-[#11150e] p-4">
                <Activity size={16} className="text-[#d7ff32] mt-0.5 shrink-0" />
                <p className="text-xs text-[#efffca] leading-relaxed">
                  The Native Node must remain continuously running to claim and execute deterministic jobs.
                </p>
              </div>
            </div>
          </div>

          <a href="?page=console" className="inline-flex w-full items-center justify-center gap-2 bg-[#d7ff32] px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#090b08] hover:bg-[#efffca] transition-colors">
            Setup Node in Console <ArrowRight size={14} />
          </a>
        </section>

        <section className="border border-[#2a3621] bg-[#090b08] p-6 lg:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center bg-[#2a3621]/50 text-[#88917d]">
              <ShieldCheck size={20} />
            </div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#f1f3e8]">Beta Limitations</h2>
          </div>

          <p className="text-[#88917d] leading-relaxed mb-8">
            This technical beta is strictly bounded to test deterministic execution and server-side verification algorithms.
          </p>

          <ul className="space-y-4 font-mono text-xs text-[#596252]">
            <li className="flex items-center gap-3 border-b border-[#2a3621] pb-4">
              <span className="text-red-400">×</span> No earnings or token rewards
            </li>
            <li className="flex items-center gap-3 border-b border-[#2a3621] pb-4">
              <span className="text-red-400">×</span> No permissionless marketplace
            </li>
            <li className="flex items-center gap-3 border-b border-[#2a3621] pb-4">
              <span className="text-red-400">×</span> No arbitrary workloads
            </li>
            <li className="flex items-center gap-3 border-b border-[#2a3621] pb-4">
              <span className="text-red-400">×</span> No claim beyond Native Node execution
            </li>
            <li className="flex items-center gap-3">
              <span className="text-red-400">×</span> No blockchain proofs
            </li>
          </ul>
        </section>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Box size={16} className="text-[#596252]" />
        <h3 className="font-mono text-sm uppercase tracking-widest text-[#f1f3e8]">Network Telemetry</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <section className="border border-[#2a3621] bg-[#090b08] p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-4">Current State</h2>
            {isLoadingSummary ? (
              <div className="flex animate-pulse space-y-4 flex-col">
                <div className="h-10 bg-[#11150e] rounded"></div>
                <div className="h-10 bg-[#11150e] rounded"></div>
              </div>
            ) : summary ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#2a3621] pb-2">
                  <span className="text-[#596252]">TOTAL PROVIDERS</span>
                  <span className="text-[#efffca]">{summary.providerCount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#2a3621] pb-2">
                  <span className="text-[#596252]">ONLINE</span>
                  <span className="text-[#d7ff32] flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d7ff32] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d7ff32]"></span>
                    </span>
                    {summary.onlineProviderCount}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#2a3621] pb-2">
                  <span className="text-[#596252]">VERIFIED JOBS</span>
                  <span className="text-[#efffca]">{summary.totalVerifiedJobs}</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="border border-[#2a3621] bg-[#090b08] p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32] mb-4">Recent Jobs</h2>
            {isLoadingJobs ? (
              <div className="h-32 flex items-center justify-center">
                <Activity className="animate-spin text-[#596252]" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => (
                  <a key={job.id} href={`?page=proof-receipt&jobId=${job.id}`} className="block border border-[#2a3621] bg-[#11150e] p-3 text-[10px] font-mono hover:border-[#d7ff32]/50 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <span className="text-[#88917d] truncate mr-2 group-hover:text-[#efffca] transition-colors" title={job.id}>{job.id.substring(0, 8)}...</span>
                      <span className={`px-2 py-0.5 w-fit ${job.status === 'completed' ? 'bg-[#d7ff32]/10 text-[#d7ff32]' : job.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[#596252] flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span>{job.cycles} CYCLES</span>
                      <span title={job.providerId}>PROV: {job.providerId.substring(0, 6)}...</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#596252] text-xs font-mono">No recent jobs</div>
            )}
          </section>
        </aside>

        <main className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-[#2a3621] bg-[#090b08] p-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596252]" size={16} />
              <input 
                type="text" 
                placeholder="Search by Provider ID or CPU Model..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-xs pl-10 pr-4 py-3 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
              />
            </div>
          </div>

          <div className="border border-[#2a3621] bg-[#090b08] overflow-hidden">
            {isLoadingProviders ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#596252] gap-4">
                <Activity className="animate-spin" size={24} />
                <span className="font-mono text-xs tracking-widest uppercase">Fetching Providers</span>
              </div>
            ) : isErrorProviders ? (
              <div className="h-64 flex flex-col items-center justify-center text-red-400 gap-4 bg-red-500/5">
                <AlertCircle size={24} />
                <span className="font-mono text-xs tracking-widest uppercase">Failed to load providers</span>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#596252] gap-4">
                <Server size={24} />
                <span className="font-mono text-xs tracking-widest uppercase">No providers found</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs whitespace-nowrap">
                  <thead className="bg-[#11150e] border-b border-[#2a3621] text-[10px] text-[#596252] tracking-widest">
                    <tr>
                      <th className="px-5 py-4 font-normal">STATUS</th>
                      <th className="px-5 py-4 font-normal">PROVIDER ID</th>
                      <th className="px-5 py-4 font-normal">CPU SPEC</th>
                      <th className="px-5 py-4 font-normal">THREADS</th>
                      <th className="px-5 py-4 font-normal">LAST SEEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3621]/50 text-[#88917d] text-[11px]">
                    {filteredProviders.map(provider => (
                      <tr key={provider.id} className="hover:bg-[#1a2215] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${provider.status === 'online' ? 'bg-[#d7ff32] shadow-[0_0_8px_#d7ff32]' : 'bg-red-500'}`}></div>
                            <span className={provider.status === 'online' ? 'text-[#d7ff32]' : 'text-red-400'}>{provider.status.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Hash size={12} className="text-[#596252]" />
                            <span className="text-[#efffca]" title={provider.id}>{provider.id.substring(0, 16)}...</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 max-w-[200px] truncate" title={`${provider.cpuVendor} ${provider.cpuModel}`}>
                            <Cpu size={12} className="text-[#596252]" />
                            <span>{provider.cpuVendor} {provider.cpuModel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">{provider.logicalProcessors}</td>
                        <td className="px-5 py-4">{new Date(provider.lastSeenAt).toISOString().replace('T', ' ').substring(0, 19)} UTC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
