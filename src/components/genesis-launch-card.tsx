import type { GenesisLaunch } from '@api-client';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { formatEther } from 'viem';

function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatAmount(value: string) {
  const raw = BigInt(value);
  if (raw === 0n) return '0';
  if (raw < 1_000_000_000_000n) return '<0.000001';
  const [whole, fraction = ''] = formatEther(raw).split('.');
  const visibleFraction = fraction.slice(0, 6).replace(/0+$/, '');
  return `${BigInt(whole).toLocaleString('en-US')}${visibleFraction ? `.${visibleFraction}` : ''}`;
}

export function GenesisLaunchCard({
  launch,
  actions,
}: {
  launch: GenesisLaunch;
  actions?: React.ReactNode;
}) {
  const imageUrl = `https://ipfs.io/ipfs/${encodeURIComponent(launch.logoCid)}`;

  return (
    <article className="border border-[#2a3621] bg-[#090b08] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <img
          src={imageUrl}
          alt={`${launch.tokenName} canonical CPU-generated logo`}
          className="h-24 w-24 shrink-0 border border-[#35412c] bg-black [image-rendering:pixelated]"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d7ff32]">{launch.symbol}</p>
              <h2 className="mt-1 text-xl font-semibold text-[#efffca]">{launch.tokenName}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 border border-[#d7ff32]/35 bg-[#d7ff32]/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#d7ff32]">
              <ShieldCheck size={12} aria-hidden="true" /> On-chain verified
            </span>
          </div>

          <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#596252]">Token contract</dt>
              <dd className="mt-1">
                <a href={launch.explorer.token} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#c7d0bf] hover:text-[#d7ff32]">
                  {shortAddress(launch.tokenAddress)} <ExternalLink size={12} aria-hidden="true" />
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#596252]">Creator</dt>
              <dd className="mt-1 font-mono text-[#c7d0bf]">{shortAddress(launch.creatorWalletAddress)}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#596252]">Launch block</dt>
              <dd className="mt-1 text-[#c7d0bf]">#{launch.launchBlockNumber}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-[#596252]">Launch time</dt>
              <dd className="mt-1 text-[#c7d0bf]">{new Date(launch.launchTimestamp).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-2 border-t border-[#2a3621] pt-4 sm:grid-cols-3">
            {[
              ['Native due', formatAmount(launch.creatorNativeDue)],
              ['WETH due', formatAmount(launch.creatorWethDue)],
              [`${launch.symbol} due`, formatAmount(launch.creatorGenesisTokenDue)],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0d100b] p-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#596252]">{label}</p>
                <p className="mt-1 break-all font-mono text-sm text-[#efffca]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider">
            <a href={launch.explorer.deploymentTx} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#88917d] hover:text-[#d7ff32]">
              Deployment tx <ExternalLink size={11} aria-hidden="true" />
            </a>
            <a href={launch.explorer.launchTx} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#88917d] hover:text-[#d7ff32]">
              Launch tx <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
          {actions && <div className="mt-5">{actions}</div>}
        </div>
      </div>
    </article>
  );
}