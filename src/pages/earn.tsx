import { Coins, Cpu, LockKeyhole, ShieldCheck, Wallet } from 'lucide-react';
import { useConsoleAccess } from '../components/wallet-access';

const readiness = [
  {
    title: 'ISOC token deployed',
    detail: 'The token address will be supplied after deployment and will never be hardcoded.',
  },
  {
    title: 'Staking contract audited',
    detail: 'Deposit, withdrawal, reward accounting, and emergency controls must pass testing and audit.',
  },
  {
    title: 'Provider ownership verified',
    detail: 'A signed wallet identity must be bound to the Native Node provider before rewards can accrue.',
  },
  {
    title: 'Settlement activated',
    detail: 'Completed deterministic jobs must reconcile with the escrow and reward contracts.',
  },
];

export function EarnPage() {
  const { isReady, address } = useConsoleAccess();

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 font-mono text-xs uppercase tracking-[.18em] text-[#d7ff32]">Future staking utility</div>
          <h1 className="text-4xl font-bold tracking-tight text-[#f1f3e8] lg:text-6xl">Earn with Isogate</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#88917d]">
            A planned staking surface for users who support deterministic compute providers. Rewards remain inactive until the ISOC token and audited staking infrastructure are deployed.
          </p>
        </div>
        <span className="border border-[#f6c453]/50 bg-[#f6c453]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#f6c453]">
          Coming soon
        </span>
      </header>

      <div className="mb-8 border border-[#f6c453]/30 bg-[#f6c453]/10 p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 shrink-0 text-[#f6c453]" size={18} />
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#f6c453]">Staking is not active</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#d8d0a8]">
              This is a frontend preview only. No token balance, APY, reward, stake, approval, or transaction is currently calculated or submitted.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <section className="border border-[#2a3621] bg-[#090b08]">
          <div className="flex items-center justify-between border-b border-[#2a3621] bg-[#11150e] px-6 py-5">
            <div className="flex items-center gap-3">
              <Coins className="text-[#d7ff32]" size={18} />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">Staking preview</h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#596252]">Robinhood Chain</span>
          </div>

          <div className="p-6 lg:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Wallet', isReady ? 'Connected' : 'Not connected'],
                ['ISOC balance', 'Unavailable'],
                ['Earned rewards', 'Unavailable'],
              ].map(([label, value]) => (
                <div key={label} className="border border-[#2a3621] bg-[#0d0e0c] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#596252]">{label}</div>
                  <div className="mt-3 font-mono text-sm text-[#efffca]">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <label htmlFor="future-stake-amount" className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#596252]">
                Amount to stake
              </label>
              <div className="flex border border-[#2a3621] bg-[#11150e]">
                <input
                  id="future-stake-amount"
                  type="text"
                  value=""
                  disabled
                  placeholder="Available after contract deployment"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 font-mono text-xs text-[#88917d] outline-none disabled:cursor-not-allowed"
                />
                <span className="flex items-center border-l border-[#2a3621] px-4 font-mono text-xs text-[#596252]">ISOC</span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-5 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 bg-[#d7ff32]/25 px-5 font-mono text-xs font-bold uppercase tracking-widest text-[#88917d]"
            >
              <LockKeyhole size={15} />
              Staking coming soon
            </button>

            <div className="mt-6 flex items-start gap-3 border-t border-[#2a3621] pt-5">
              <Wallet size={16} className="mt-0.5 shrink-0 text-[#596252]" />
              <p className="min-w-0 break-words font-mono text-[10px] leading-relaxed text-[#687360]">
                {isReady && address
                  ? `Connected wallet: ${address}. No signing request will be created on this page yet.`
                  : 'Connect a wallet only to preview connection state. No signing request will be created on this page yet.'}
              </p>
            </div>
          </div>
        </section>

        <aside className="border border-[#2a3621] bg-[#090b08]">
          <div className="flex items-center gap-3 border-b border-[#2a3621] bg-[#11150e] px-6 py-5">
            <ShieldCheck className="text-[#d7ff32]" size={18} />
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">Activation requirements</h2>
          </div>
          <div className="divide-y divide-[#2a3621]">
            {readiness.map((item, index) => (
              <div key={item.title} className="flex gap-4 p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#35412c] font-mono text-[10px] text-[#596252]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-[#efffca]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#687360]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-8 grid gap-px bg-[#2a3621] sm:grid-cols-3">
        {[
          [Cpu, 'Provide compute', 'Run bounded deterministic jobs through a verified Native Node.'],
          [Coins, 'Stake ISOC', 'Lock tokens only after audited contracts and addresses are active.'],
          [ShieldCheck, 'Receive settlement', 'Rewards will depend on accepted work and contract accounting, not a displayed estimate.'],
        ].map(([Icon, title, detail]) => {
          const StepIcon = Icon as typeof Cpu;
          return (
            <div key={title as string} className="bg-[#0d0e0c] p-6">
              <StepIcon size={19} className="text-[#d7ff32]" />
              <h3 className="mt-5 font-mono text-xs uppercase tracking-wider text-[#efffca]">{title as string}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#687360]">{detail as string}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}