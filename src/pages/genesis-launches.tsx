import { useState } from 'react';
import {
  getListGenesisLaunchesQueryKey,
  useListGenesisLaunches,
} from '@api-client';
import { ChevronLeft, ChevronRight, Coins, LoaderCircle } from 'lucide-react';
import { GenesisLaunchCard } from '../components/genesis-launch-card';

const PAGE_SIZE = 12;

export function GenesisLaunchesPage() {
  const [page, setPage] = useState(1);
  const launches = useListGenesisLaunches({ page, limit: PAGE_SIZE }, {
    query: {
      queryKey: getListGenesisLaunchesQueryKey({ page, limit: PAGE_SIZE }),
      refetchInterval: 20_000,
    },
  });
  const totalPages = Math.max(1, Math.ceil((launches.data?.total ?? 0) / PAGE_SIZE));

  return (
    <main className="section-shell py-12 sm:py-16">
      <header className="border-b border-[#2a3621] pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#d7ff32]">Genesis public registry</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#efffca] sm:text-5xl">Isogate CPU launches</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#88917d]">
          Tokens shown here passed canonical Native Node generation, creator approval, immutable IPFS storage,
          registry verification, factory deployment, and the Robinhood Chain liquidity launch.
        </p>
      </header>

      <div className="mt-8" aria-live="polite">
        {launches.isLoading ? (
          <div className="flex min-h-56 items-center justify-center border border-[#2a3621]">
            <LoaderCircle className="animate-spin text-[#d7ff32]" aria-label="Loading verified launches" />
          </div>
        ) : launches.isError ? (
          <div role="alert" className="border border-[#7a3434] bg-[#241010] p-5 text-sm text-[#f0adad]">
            Verified launches could not be loaded. The API fails closed when live chain reads are unavailable.
          </div>
        ) : launches.data?.items.length ? (
          <div className="grid gap-5">
            {launches.data.items.map((launch) => <GenesisLaunchCard key={launch.tokenAddress} launch={launch} />)}
          </div>
        ) : (
          <div className="border border-dashed border-[#35412c] px-6 py-16 text-center">
            <Coins size={28} className="mx-auto text-[#46503e]" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium text-[#c7d0bf]">No verified Genesis launches yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#687360]">
              This list remains empty until the first canonical token is deployed, launched, and reconciled from successful on-chain receipts.
            </p>
            <a href="?page=genesis" className="mt-5 inline-flex min-h-10 items-center border border-[#d7ff32] px-4 font-mono text-[10px] uppercase tracking-wider text-[#d7ff32] hover:bg-[#d7ff32] hover:text-[#0d0e0c]">
              Open Genesis
            </a>
          </div>
        )}
      </div>

      {(launches.data?.total ?? 0) > PAGE_SIZE && (
        <nav className="mt-8 flex items-center justify-between border-t border-[#2a3621] pt-5" aria-label="Launch pages">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="inline-flex min-h-10 items-center gap-2 border border-[#35412c] px-3 font-mono text-[10px] uppercase text-[#c7d0bf] disabled:opacity-40">
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#687360]">Page {page} / {totalPages}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="inline-flex min-h-10 items-center gap-2 border border-[#35412c] px-3 font-mono text-[10px] uppercase text-[#c7d0bf] disabled:opacity-40">
            Next <ChevronRight size={14} />
          </button>
        </nav>
      )}
    </main>
  );
}