import { useState } from 'react';
import { useGetNetworkSummary, useListNetworkProviders, useListNetworkJobs } from '@api-client';
import { Activity, Search, Globe, Cpu, CheckCircle2, Eye, LockKeyhole } from 'lucide-react';

export function NetworkExplorerPage() {
  const [activeTab, setActiveTab] = useState<'providers'|'jobs'>('providers');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: summary } = useGetNetworkSummary();
  const { data: providers, isLoading: isLoadingProviders } = useListNetworkProviders();
  const { data: jobs, isLoading: isLoadingJobs } = useListNetworkJobs();

  const filteredProviders = providers?.filter(p => p.id.includes(searchTerm) || p.cpuModel.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const filteredJobs = jobs?.filter(j => j.id.includes(searchTerm) || j.providerId.includes(searchTerm)) || [];

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Network Explorer</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">Public, read-only network telemetry</p>
        </div>
        <span className="w-fit border border-[#d7ff32]/35 bg-[#d7ff32]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
          Public access
        </span>
      </header>

      <section className="mb-8 grid gap-4 lg:grid-cols-2" aria-labelledby="network-access-heading">
        <div className="border border-[#d7ff32]/30 bg-[#0b0e09] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Eye size={18} className="shrink-0 text-[#d7ff32]" aria-hidden="true" />
            <h2 id="network-access-heading" className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
              Public read-only view
            </h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#aab3a2]">
            Anyone can inspect aggregate network activity, public provider records, and redacted completed or
            rejected jobs. No wallet or account is required, and this page cannot modify network data.
          </p>
        </div>
        <div className="border border-[#2a3621] bg-[#090b08] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <LockKeyhole size={18} className="shrink-0 text-[#f6c453]" aria-hidden="true" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#f6c453]">Private data excluded</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#88917d]">
            Credentials, Agent attribution, job inputs, execution results, traces, lease tokens, and queued or
            assigned job details remain private to authenticated control flows.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Providers', value: summary?.providerCount ?? '-', icon: <Globe size={16} /> },
          { label: 'Online Nodes', value: summary?.onlineProviderCount ?? '-', icon: <Activity size={16} className="text-[#d7ff32]" /> },
          { label: 'Total Verified Jobs', value: summary?.totalVerifiedJobs ?? '-', icon: <CheckCircle2 size={16} /> },
          { label: 'Queued Work', value: summary?.jobs.queued ?? '-', icon: <Cpu size={16} /> }
        ].map((stat, i) => (
          <div key={i} className="border border-[#2a3621] bg-[#090b08] p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
            <div className="text-[#596252]">{stat.icon}</div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#efffca]">{stat.value}</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#2a3621] bg-[#090b08] overflow-hidden flex flex-col">
        <div className="border-b border-[#2a3621] flex flex-col sm:flex-row sm:items-center justify-between bg-[#11150e]">
          <div className="flex font-mono text-xs uppercase tracking-widest" role="tablist" aria-label="Public network records">
            <button 
              type="button"
              role="tab"
              aria-selected={activeTab === 'providers'}
              onClick={() => setActiveTab('providers')}
              className={`px-6 py-4 border-b-2 transition-colors ${activeTab === 'providers' ? 'border-[#d7ff32] text-[#d7ff32]' : 'border-transparent text-[#596252] hover:text-[#88917d]'}`}
            >
              Providers
            </button>
            <button 
              type="button"
              role="tab"
              aria-selected={activeTab === 'jobs'}
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-4 border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-[#d7ff32] text-[#d7ff32]' : 'border-transparent text-[#596252] hover:text-[#88917d]'}`}
            >
              Jobs
            </button>
          </div>
          <div className="p-3 sm:p-0 sm:pr-4 relative w-full sm:w-64">
            <Search className="absolute left-6 sm:left-3 top-1/2 -translate-y-1/2 text-[#596252]" size={14} />
            <label htmlFor="network-record-search" className="sr-only">Search public network records</label>
            <input
              id="network-record-search"
              type="text" 
              placeholder="Search ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050604] border border-[#2a3621] text-[#efffca] font-mono text-[10px] pl-9 pr-3 py-2 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32]"
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto min-h-[400px]">
          {activeTab === 'providers' && (
            isLoadingProviders ? (
              <div className="h-full flex items-center justify-center text-[#596252] min-h-[300px]">
                <Activity className="animate-spin" size={24} />
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs whitespace-nowrap">
                <thead className="bg-[#0d0e0c] text-[10px] text-[#596252] tracking-widest border-b border-[#2a3621]">
                  <tr>
                    <th className="px-5 py-4 font-normal">ID</th>
                    <th className="px-5 py-4 font-normal">STATUS</th>
                    <th className="px-5 py-4 font-normal">CPU</th>
                    <th className="px-5 py-4 font-normal">ARCH</th>
                    <th className="px-5 py-4 font-normal">REGISTERED (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3621]/50 text-[#88917d]">
                  {filteredProviders.map(p => (
                    <tr key={p.id} className="hover:bg-[#1a2215]">
                      <td className="px-5 py-3 text-[#efffca]" title={p.id}>{p.id.substring(0,12)}...</td>
                      <td className="px-5 py-3">
                        <span className={p.status === 'online' ? 'text-[#d7ff32]' : 'text-[#596252]'}>{p.status.toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3 truncate max-w-[150px]" title={p.cpuModel}>{p.cpuVendor} {p.cpuModel}</td>
                      <td className="px-5 py-3">{p.architecture}</td>
                      <td className="px-5 py-3">{new Date(p.registeredAt).toISOString().replace('T', ' ').substring(0, 19)}</td>
                    </tr>
                  ))}
                  {filteredProviders.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-[#596252]">No providers match the search</td></tr>
                  )}
                </tbody>
              </table>
            )
          )}

          {activeTab === 'jobs' && (
            isLoadingJobs ? (
              <div className="h-full flex items-center justify-center text-[#596252] min-h-[300px]">
                <Activity className="animate-spin" size={24} />
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs whitespace-nowrap">
                <thead className="bg-[#0d0e0c] text-[10px] text-[#596252] tracking-widest border-b border-[#2a3621]">
                  <tr>
                    <th className="px-5 py-4 font-normal">JOB ID</th>
                    <th className="px-5 py-4 font-normal">STATUS</th>
                    <th className="px-5 py-4 font-normal">PROVIDER</th>
                    <th className="px-5 py-4 font-normal">CYCLES</th>
                    <th className="px-5 py-4 font-normal">CREATED (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3621]/50 text-[#88917d]">
                  {filteredJobs.map(j => (
                    <tr key={j.id} className="hover:bg-[#1a2215]">
                      <td className="px-5 py-3 text-[#efffca]" title={j.id}>{j.id.substring(0,12)}...</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-sm ${j.status === 'completed' ? 'bg-[#d7ff32]/10 text-[#d7ff32]' : j.status === 'rejected' ? 'bg-red-500/10 text-red-400' : j.status === 'assigned' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#2a3621] text-[#88917d]'}`}>
                          {j.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3" title={j.providerId}>{j.providerId.substring(0,12)}...</td>
                      <td className="px-5 py-3">{j.cycles}</td>
                      <td className="px-5 py-3">{new Date(j.createdAt).toISOString().replace('T', ' ').substring(0, 19)}</td>
                    </tr>
                  ))}
                  {filteredJobs.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-[#596252]">No jobs match the search</td></tr>
                  )}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
