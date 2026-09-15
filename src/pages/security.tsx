import { ShieldCheck, Network, Cpu, LockKeyhole } from 'lucide-react';

export function SecurityPage() {
  return (
    <div className="section-shell py-20 lg:py-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-medium tracking-tight text-[#f1f3e8] mb-8">Security & Trust</h1>
        <p className="text-[#8e9787] mb-16 text-xl leading-relaxed">
          The public simulator is client-side. CPU Console registers a Native Node, queues bounded built-in work, and verifies Native Node execution against an independent server recomputation.
        </p>

        <h2 className="text-3xl font-medium text-[#efffca] mb-10 border-b border-[#d7ff32]/20 pb-4">Trust Boundaries</h2>
        
        <div className="grid gap-8 md:grid-cols-2 mb-20">
          <div className="bg-[#090b08] border border-[#d7ff32]/20 p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-6 text-[#d7ff32]">
              <Cpu size={24} />
              <h3 className="font-mono text-base uppercase tracking-wider font-bold">Current Simulator</h3>
            </div>
            <p className="text-base text-[#8e9787] mb-6 leading-relaxed">
              CPU Console persists provider capabilities and bounded jobs. Native Node executes only the built-in deterministic replay and the server stores its own canonical verified result.
            </p>
            <ul className="text-sm text-[#687360] space-y-4 font-mono">
              <li className="flex gap-2.5"><span>•</span> Bounded native execution and server recomputation</li>
              <li className="flex gap-2.5"><span>•</span> No arbitrary workload execution</li>
              <li className="flex gap-2.5"><span>•</span> Wallet connection without signature or transaction</li>
              <li className="flex gap-2.5"><span>•</span> No wallet-based backend authentication</li>
            </ul>
          </div>

          <div className="bg-[#090b08] border border-[#35412c] p-8 rounded-lg opacity-90">
            <div className="flex items-center gap-4 mb-6 text-[#88917d]">
              <Network size={24} />
              <h3 className="font-mono text-base uppercase tracking-wider font-bold">Planned Network</h3>
            </div>
            <p className="text-base text-[#8e9787] mb-6 leading-relaxed">
              Future decentralized deployments will rely on cryptoeconomic staking and slashing models.
            </p>
            <ul className="text-sm text-[#687360] space-y-4 font-mono">
              <li className="flex gap-2.5"><span>•</span> Verifier node spot-checks</li>
              <li className="flex gap-2.5"><span>•</span> Provider quality bonds</li>
              <li className="flex gap-2.5"><span>•</span> On-chain execution parity</li>
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-medium text-[#efffca] mb-8 border-b border-[#d7ff32]/20 pb-4">Vulnerability Reporting</h2>
        <div className="bg-[#11130f] border-l-2 border-[#d7ff32] p-8 text-base text-[#8e9787] leading-relaxed mb-10">
          <p className="mb-5">
            Since Isogate is currently an experimental demonstration without production deployments, real user funds, or live contracts, standard security bounties are not active.
          </p>
          <p>
            A public vulnerability intake channel is not linked yet. Do not submit sensitive vulnerability details through unverified channels. Check the <a href="?page=repository" className="text-[#d7ff32] hover:underline">repository status page</a> for the current source and reporting-channel status.
          </p>
        </div>
      </div>
    </div>
  );
}
