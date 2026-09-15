import { useEffect, useState, ReactNode } from 'react';
import { ChevronDown, ExternalLink, Menu, X, Cpu, Terminal, ArrowRight, CircleDashed, Globe, Key, Settings, FileText, Activity, Code, Coins, Github, Package, Sparkles, LayoutDashboard, ListFilter } from 'lucide-react';
import { getGetNetworkSummaryQueryKey, useGetNetworkSummary } from '@api-client';
import { HeaderWalletControl } from './wallet-access';

const logoUrl = `${import.meta.env.BASE_URL}isogate-logo.png`;

function Nav({ walletEnabled }: { walletEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const {
    data: networkSummary,
    dataUpdatedAt,
    isLoading: statusLoading,
    isError: statusError,
  } = useGetNetworkSummary({
    query: {
      queryKey: getGetNetworkSummaryQueryKey(),
      refetchInterval: 5_000,
      refetchOnWindowFocus: true,
      staleTime: 4_000,
    },
  });
  const items = [['Mechanism', '?page=home#mechanism'], ['Spec', '?page=home#spec'], ['Network', '?page=home#economics'], ['Roadmap', '?page=home#roadmap']];
  const tools = [
    { group: 'Provider', title: 'CPU Console', detail: 'Register a Native Node, queue work, and compare verified results.', href: '?page=console', icon: <Terminal size={17} />, status: 'Live beta' },
    { group: 'Provider', title: 'Provider App', detail: 'Network node status and capabilities.', href: '?page=provider', icon: <Globe size={17} />, status: 'Live beta' },
    { group: 'Genesis', title: 'Isogate Genesis', detail: 'Deterministic CPU identity and Robinhood Chain launch flow.', href: '?page=genesis', icon: <Sparkles size={17} />, status: 'Mainnet live' },
    { group: 'Genesis', title: 'Creator Dashboard', detail: 'Manage creator launches and claim verified FeeVault balances.', href: '?page=creator-dashboard', icon: <LayoutDashboard size={17} />, status: 'Live' },
    { group: 'Genesis', title: 'Genesis Launches', detail: 'Browse tokens verified and launched through Isogate CPU.', href: '?page=genesis-launches', icon: <ListFilter size={17} />, status: 'Live' },
    { group: 'Agent', title: 'Agent Integration', detail: 'Register and manage bounded external agents.', href: '?page=agent-control', icon: <Key size={17} />, status: 'Live beta' },
    { group: 'Settlement', title: 'Token & Settlement', detail: 'Future escrow, bonds, and compute settlement.', href: '?page=token-settlement', icon: <Settings size={17} />, status: 'Coming soon' },
    { group: 'Explorer', title: 'Network Explorer', detail: 'Global state & record inspection.', href: '?page=network-explorer', icon: <Activity size={17} />, status: 'Live beta' },
    { group: 'Explorer', title: 'Verification Receipt', detail: 'Verification receipt lookup.', href: '?page=proof-receipt', icon: <FileText size={17} />, status: 'Live beta' },
    { group: 'Execute', title: 'Machine Visualizer', detail: 'Future authenticated CPU trace debugger.', href: '?page=machine-visualizer', icon: <Cpu size={17} />, status: 'Coming soon' },
    { group: 'Developer', title: 'Integration Hub', detail: 'REST API guide for Agent and Native Node developers.', href: '?page=integration-hub', icon: <Code size={17} />, status: 'Live beta' },
    { group: 'Settlement', title: 'Earn', detail: 'Future ISOC staking and compute rewards.', href: '?page=earn', icon: <Coins size={17} />, status: 'Coming soon' },
  ];

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
        setStatusOpen(false);
      }
    };
    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, []);

  useEffect(() => {
    if (!toolsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [toolsOpen]);

  const closeNavigation = () => {
    setOpen(false);
    setToolsOpen(false);
    setStatusOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#d7ff32]/20 bg-[#0d0e0c]/95 backdrop-blur-sm">
      <div className="section-shell flex h-16 items-center justify-between">
        <a href="?page=home" className="flex items-center gap-3" data-testid="link-isogate-home">
          <img src={logoUrl} alt="" className="h-10 w-10 shrink-0 object-contain" />
          <span className="font-mono text-base font-medium tracking-[.16em] text-[#efffca]">ISOGATE</span>
        </a>
        <nav className={`${open ? 'absolute left-0 right-0 top-16 block max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[#d7ff32]/20 bg-[#0d0e0c] p-5' : 'hidden'} lg:block lg:static lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 w-full lg:w-auto`} aria-label="Primary">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6 w-full lg:w-auto">
            <button type="button" onClick={() => { setToolsOpen((value) => !value); setStatusOpen(false); }} className={`inline-flex min-h-11 items-center justify-between lg:justify-start gap-2 font-mono text-xs uppercase tracking-[.12em] transition-colors w-full lg:w-auto ${toolsOpen ? 'text-[#d7ff32]' : 'text-[#88917d] hover:text-[#d7ff32]'}`} aria-expanded={toolsOpen} aria-controls="tools-menu" data-testid="button-nav-tools">
              Apps <ChevronDown size={14} className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {items.map(([label, href]) => <a key={label} href={href} onClick={closeNavigation} className="font-mono text-xs uppercase tracking-[.12em] text-[#88917d] transition-colors hover:text-[#d7ff32]" data-testid={`link-nav-${label.toLowerCase()}`}>{label}</a>)}
            <a href="?page=docs" onClick={closeNavigation} className="inline-flex items-center gap-2 border border-[#d7ff32] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c]" data-testid="link-nav-docs">Docs <ExternalLink size={14} /></a>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setStatusOpen((value) => !value); setToolsOpen(false); }}
                className="inline-flex min-h-11 w-full items-center justify-between gap-3 border border-[#35412c] bg-[#11150e] px-3 font-mono text-[10px] uppercase tracking-[.12em] text-[#efffca] transition-colors hover:border-[#d7ff32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff32] lg:w-auto"
                aria-expanded={statusOpen}
                aria-controls="live-network-status"
                data-testid="button-live-status"
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusError ? 'bg-red-400' : 'bg-[#d7ff32] shadow-[0_0_10px_#d7ff32]'}`} aria-hidden="true" />
                  Live Status
                </span>
                <span className="text-[#88917d]">
                  {statusLoading ? 'Syncing' : statusError ? 'Offline' : `${networkSummary?.onlineProviderCount ?? 0}/${networkSummary?.providerCount ?? 0}`}
                </span>
              </button>
              {statusOpen && (
                <div
                  id="live-network-status"
                  className="relative z-50 mt-3 w-full border border-[#d7ff32]/35 bg-[#090b08] p-4 shadow-[0_24px_70px_rgba(0,0,0,.85)] lg:absolute lg:right-0 lg:top-full lg:w-[360px]"
                  role="region"
                  aria-label="Live public network status"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#2a3621] pb-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#d7ff32]">Public network activity</div>
                      <div className="mt-1 text-xs text-[#687360]">Refreshes every 5 seconds</div>
                    </div>
                    <button type="button" onClick={() => setStatusOpen(false)} className="p-2 text-[#88917d] hover:text-[#d7ff32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d7ff32]" aria-label="Close live status"><X size={15} /></button>
                  </div>
                  {statusError ? (
                    <div className="py-6 text-sm text-red-300">Public status is temporarily unavailable.</div>
                  ) : statusLoading || !networkSummary ? (
                    <div className="flex items-center gap-3 py-6 font-mono text-xs uppercase tracking-wider text-[#88917d]"><Activity size={15} className="animate-spin" /> Loading live data</div>
                  ) : (
                    <>
                      <dl className="grid grid-cols-2 gap-px bg-[#2a3621] my-4">
                        {[
                          ['Providers online', `${networkSummary.onlineProviderCount} / ${networkSummary.providerCount}`],
                          ['Verified jobs', networkSummary.totalVerifiedJobs],
                          ['Queued', networkSummary.jobs.queued],
                          ['Assigned', networkSummary.jobs.assigned],
                          ['Completed', networkSummary.jobs.completed],
                          ['Rejected', networkSummary.jobs.rejected],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-[#0d0e0c] p-3">
                            <dt className="font-mono text-[9px] uppercase tracking-wider text-[#596252]">{label}</dt>
                            <dd className="mt-2 font-mono text-lg text-[#efffca]">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#596252]">
                          Updated {dataUpdatedAt ? new Date(dataUpdatedAt).toISOString().slice(11, 19) : '—'} UTC
                        </span>
                        <a href="?page=network-explorer" onClick={closeNavigation} className="font-mono text-[10px] uppercase tracking-wider text-[#d7ff32] hover:underline">
                          Open explorer
                        </a>
                      </div>
                    </>
                  )}
                  <p className="mt-4 border-t border-[#2a3621] pt-3 text-[11px] leading-relaxed text-[#596252]">
                    Counts represent public provider and job records, not unique users or wallet ownership.
                  </p>
                </div>
              )}
            </div>
            <HeaderWalletControl enabled={walletEnabled} />
          </div>
          {toolsOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 top-16 z-40 cursor-default bg-[#050604]/75 backdrop-blur-[10px]"
                onClick={() => setToolsOpen(false)}
                aria-label="Close apps menu"
              />
              <div id="tools-menu" className="relative z-50 mt-5 max-h-[calc(100dvh-7rem)] overflow-y-auto border border-[#d7ff32]/30 bg-[#090b08] shadow-[0_28px_100px_rgba(0,0,0,.9),0_0_50px_rgba(215,255,50,.06)] md:fixed md:left-1/2 md:top-20 md:mt-0 md:w-[min(1440px,calc(100%-48px))] md:-translate-x-1/2" role="region" aria-label="Isogate apps">
                <div className="flex flex-col gap-3 border-b border-[#d7ff32]/20 bg-[#11150e] px-6 py-6 sm:flex-row sm:items-end sm:justify-between md:px-8">
                  <div>
                    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[.16em] text-[#d7ff32]"><span className="h-1.5 w-1.5 bg-[#d7ff32] shadow-[0_0_8px_#d7ff32]" /> Isogate Apps</div>
                    <div className="mt-2 text-base text-[#88917d]">Open live beta tools and clearly labeled upcoming product surfaces.</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="border border-[#35412c] px-3 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#687360]">CPU Console / wallet access live</span>
                    <HeaderWalletControl enabled={walletEnabled} />
                  </div>
                </div>
                <div className="grid gap-px bg-[#d7ff32]/15 sm:grid-cols-2">
                  {tools.map((tool, index) => (
                    <a key={tool.title} href={tool.href} onClick={closeNavigation} className="group relative flex min-h-[140px] flex-col bg-[#0d0e0c] p-6 transition-colors duration-200 hover:bg-[#d7ff32] active:bg-[#c9f020] focus-visible:bg-[#d7ff32] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#d7ff32] focus-visible:outline-offset-[-1px]">
                      <div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center border border-[#d7ff32]/35 bg-[#d7ff32]/5 text-[#d7ff32] transition-colors group-hover:border-[#0d0e0c] group-hover:bg-[#0d0e0c]/10 group-hover:text-[#0d0e0c] group-focus-visible:border-[#0d0e0c] group-focus-visible:bg-[#0d0e0c]/10 group-focus-visible:text-[#0d0e0c]">{tool.icon}</span><span className="font-mono text-[10px] uppercase tracking-[.14em] text-[#596252] transition-colors group-hover:text-[#0d0e0c] group-focus-visible:text-[#0d0e0c]">{String(index + 1).padStart(2, '0')} / {tool.group}</span></div>
                      <div className="mt-5 flex items-center gap-2 text-base font-medium text-[#efffca] transition-colors group-hover:text-[#0d0e0c] group-focus-visible:text-[#0d0e0c]">{tool.title}<ArrowRight size={14} className="text-[#d7ff32] transition-all group-hover:translate-x-1 group-hover:text-[#0d0e0c] group-focus-visible:text-[#0d0e0c]" /></div>
                      <div className="mt-2 flex items-end justify-between gap-4"><p className="text-sm leading-relaxed text-[#7e8878] transition-colors group-hover:text-[#0d0e0c] group-focus-visible:text-[#0d0e0c]">{tool.detail}</p><span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#596252] transition-colors group-hover:text-[#0d0e0c] group-focus-visible:text-[#0d0e0c]">{tool.status}</span></div>
                    </a>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[#d7ff32]/20 bg-[#070907] px-6 py-4 font-mono text-[10px] uppercase tracking-[.14em] text-[#596252] md:px-8">
                  <span>Isogate apps / availability labeled</span>
                  <span>Esc to close</span>
                </div>
              </div>
            </>
          )}
        </nav>
        <button type="button" onClick={() => { setOpen((value) => !value); setToolsOpen(false); setStatusOpen(false); }} className="p-2 text-[#d7ff32] lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#d7ff32]/25 bg-[#090a08] mt-auto">
      <div className="section-shell py-16">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="" className="h-11 w-11 shrink-0 object-contain" />
              <span className="font-mono text-base tracking-[.16em] text-[#efffca]">ISOGATE</span>
            </div>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-[#687360]">Deterministic CPU verification and creator-signed token launches on Robinhood Chain.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 font-mono text-xs uppercase tracking-wider text-[#88917d] sm:grid-cols-4 sm:gap-x-12">
            <div className="flex flex-col gap-3">
              <span className="text-[#efffca] font-bold tracking-widest mb-1">Product</span>
              <a href="?page=console" className="hover:text-[#d7ff32]">Console</a>
              <a href="?page=docs#isa" className="hover:text-[#d7ff32]">Spec reference</a>
              <a href="?page=status" className="hover:text-[#d7ff32]">Product Status</a>
              <a href="?page=docs" className="hover:text-[#d7ff32]">Documentation</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 font-bold tracking-widest text-[#efffca]">Apps</span>
              <a href="?page=console" className="hover:text-[#d7ff32]">CPU Console</a>
              <a href="?page=provider" className="hover:text-[#d7ff32]">Provider Network</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="?page=legal" className="mb-1 font-bold tracking-widest text-[#efffca] hover:text-[#d7ff32]">Trust &amp; Legal</a>
              <a href="?page=security" className="hover:text-[#d7ff32]">Security & Trust</a>
              <a href="?page=privacy" className="hover:text-[#d7ff32]">Privacy Policy</a>
              <a href="?page=terms" className="hover:text-[#d7ff32]">Terms of Use</a>
              <a href="?page=repository" className="inline-flex items-center gap-1 hover:text-[#d7ff32]">Repository <ExternalLink size={14} /></a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 font-bold tracking-widest text-[#efffca]">Official</span>
              <a href="https://github.com/Isogate-CPU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#d7ff32]" aria-label="Isogate on GitHub, opens in a new tab">
                <Github size={14} /> GitHub
              </a>
              <a href="https://x.com/Isogate_CPU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#d7ff32]" aria-label="Isogate on X, opens in a new tab">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-sm normal-case" aria-hidden="true">𝕏</span> X
              </a>
              <a href="https://www.npmjs.com/package/@isogate/node" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#d7ff32]" aria-label="Isogate Node package on npm, opens in a new tab">
                <Package size={14} /> npm
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-[#d7ff32]/15 pt-6 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-[#596252] sm:flex-row">
          <span>© 2026 Isogate Verification Network</span>
          <span className="inline-flex items-center gap-2"><CircleDashed size={14} /> Proof is a process.</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children, walletEnabled = true, hideFooter = false }: { children: ReactNode; walletEnabled?: boolean; hideFooter?: boolean }) {
  return (
    <div id="top" className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#0d0e0c] text-[#e9ebdf]">
      <Nav walletEnabled={walletEnabled} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
