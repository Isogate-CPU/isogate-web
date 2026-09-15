import { GenesisArtEngine } from '../components/genesis-art-engine';

export function GenesisPage() {
  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Isogate Genesis</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">
            Deterministic token creation protocol
          </p>
        </div>
        <span className="w-fit border border-[#d7ff32]/50 bg-[#d7ff32]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
          Mainnet launch stack live
        </span>
      </header>

      <GenesisArtEngine />

      <p className="mt-8 border-l-2 border-[#d7ff32]/50 pl-4 text-sm leading-6 text-[#88917d]">
        The Robinhood Chain launch contracts are live. No token exists until a wallet-bound Native Node completes the
        canonical identity job and the creator signs each approval, deployment, and liquidity transaction.
      </p>
    </div>
  );
}