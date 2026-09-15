import { Clock3, Cpu, ReceiptText, ShieldCheck } from 'lucide-react';

const currentCapabilities = [
  {
    icon: Cpu,
    title: 'Deterministic jobs',
    detail: 'Agents can submit bounded CPU replay jobs to wallet-bound Native Node providers.',
  },
  {
    icon: ShieldCheck,
    title: 'Canonical verification',
    detail: 'The server recomputes completed work before accepting the provider result.',
  },
  {
    icon: ReceiptText,
    title: 'Verification receipts',
    detail: 'Completed jobs receive integrity metadata. These receipts are not blockchain proofs.',
  },
];

export function TokenSettlementPage() {
  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Token &amp; Settlement</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">
            Economic layer for verified compute
          </p>
        </div>
        <span className="w-fit border border-[#f6c453]/50 bg-[#f6c453]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#f6c453]">
          Coming soon
        </span>
      </header>

      <section
        className="border border-[#f6c453]/35 bg-[#0b0d09] px-6 py-10 sm:px-8 lg:px-12 lg:py-14"
        aria-labelledby="settlement-status-heading"
      >
        <div className="max-w-3xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#f6c453]/40 bg-[#f6c453]/10 text-[#f6c453]">
            <Clock3 size={22} aria-hidden="true" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f6c453]">Not active in the technical beta</p>
          <h2 id="settlement-status-heading" className="mt-4 text-2xl font-semibold text-[#f1f3e8] sm:text-3xl">
            No token or onchain settlement is live yet.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#aab3a2] sm:text-base">
            This future layer is intended to coordinate job escrow, provider bonds, and settlement for verified
            compute on Robinhood Chain. Official contracts have not been deployed, so Isogate does not currently
            issue a token, move funds, calculate rewards, or require provider stakes.
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="available-now-heading">
        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#687360]">Technical beta boundary</p>
          <h2 id="available-now-heading" className="mt-2 text-xl font-semibold text-[#efffca]">What works today</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {currentCapabilities.map(({ icon: Icon, title, detail }) => (
            <article key={title} className="border border-[#2a3621] bg-[#090b08] p-6">
              <Icon size={19} className="text-[#d7ff32]" aria-hidden="true" />
              <h3 className="mt-5 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#88917d]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 border-l-2 border-[#d7ff32]/50 pl-4 text-sm leading-6 text-[#88917d]">
        Contract addresses and transaction controls will appear here only after the official contracts, security
        review, and public settlement rules are ready.
      </p>
    </div>
  );
}