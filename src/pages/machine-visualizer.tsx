import { Activity, Binary, Bug, Clock3, Cpu, ShieldCheck } from 'lucide-react';

const plannedUses = [
  {
    icon: Activity,
    title: 'Step through cycles',
    detail: 'Pause and inspect each deterministic CPU cycle instead of reading a final result only.',
  },
  {
    icon: Binary,
    title: 'Inspect machine state',
    detail: 'View the program counter, accumulator, RAM, input lane, and execution flags as they change.',
  },
  {
    icon: Bug,
    title: 'Debug replay mismatches',
    detail: 'Help Agent developers and provider operators find where a local replay diverges from canonical execution.',
  },
];

export function MachineVisualizerPage() {
  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Machine Visualizer</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">
            Cycle-by-cycle CPU debugging
          </p>
        </div>
        <span className="w-fit border border-[#f6c453]/50 bg-[#f6c453]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#f6c453]">
          Coming soon
        </span>
      </header>

      <section
        className="border border-[#f6c453]/35 bg-[#0b0d09] px-6 py-10 sm:px-8 lg:px-12 lg:py-14"
        aria-labelledby="visualizer-status-heading"
      >
        <div className="max-w-3xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#f6c453]/40 bg-[#f6c453]/10 text-[#f6c453]">
            <Clock3 size={22} aria-hidden="true" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#f6c453]">
            Private trace access is not available yet
          </p>
          <h2 id="visualizer-status-heading" className="mt-4 text-2xl font-semibold text-[#f1f3e8] sm:text-3xl">
            Detailed machine-state visualization is not active.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#aab3a2] sm:text-base">
            Public jobs intentionally exclude inputs, results, and execution traces. This visualizer will become
            available after Isogate adds an authenticated trace flow for the Agent owner or provider that executed
            the job. It will not expose private workloads through the public Network Explorer.
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="planned-use-heading">
        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#687360]">Intended users</p>
          <h2 id="planned-use-heading" className="mt-2 text-xl font-semibold text-[#efffca]">
            What this tool will be used for
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#88917d]">
            This is a developer and provider debugging tool, not a public network-monitoring page.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plannedUses.map(({ icon: Icon, title, detail }) => (
            <article key={title} className="border border-[#2a3621] bg-[#090b08] p-6">
              <Icon size={19} className="text-[#d7ff32]" aria-hidden="true" />
              <h3 className="mt-5 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#88917d]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-[#2a3621] bg-[#090b08] p-6 sm:p-8" aria-labelledby="available-tools-heading">
        <h2 id="available-tools-heading" className="font-mono text-xs uppercase tracking-widest text-[#efffca]">
          Available now
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#88917d]">
          Run a local deterministic simulation in CPU Console, or inspect the server-issued integrity metadata for
          a completed job in Verification Receipt.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="?page=console"
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-5 font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] transition-colors hover:bg-[#e4ff74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff32]"
          >
            <Cpu size={16} aria-hidden="true" />
            Open CPU Console
          </a>
          <a
            href="?page=proof-receipt"
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#35412c] px-5 font-mono text-xs uppercase tracking-wider text-[#c7d0bf] transition-colors hover:border-[#d7ff32] hover:text-[#d7ff32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff32]"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Verification Receipt
          </a>
        </div>
      </section>
    </div>
  );
}