import { CheckCircle2, Clock, MinusCircle, XCircle } from 'lucide-react';

export function StatusPage() {
  const statusMatrix = [
    { category: 'Frontend Simulation', features: [
      { name: 'Deterministic Execution Core', status: 'Available', desc: 'In-browser NAND logic evaluation' },
      { name: 'Visual Processor Flow', status: 'Available', desc: 'Animated pipeline overview' },
      { name: 'Cycle Inspector Console', status: 'Available', desc: 'Interactive step-by-step debugger' },
    ]},
    { category: 'Native Node & Verification', features: [
      { name: 'Native Node Provider Execution', status: 'Available', desc: 'Bounded built-in workloads run on registered provider hardware' },
      { name: 'Canonical Server Recomputation', status: 'Available', desc: 'Submitted results are independently recomputed before acceptance' },
      { name: 'Public Verification Receipts', status: 'Available', desc: 'Accepted provider and replay records are publicly inspectable' },
      { name: 'Verifier Network Spot-checks', status: 'Planned', desc: 'Independent node validation' },
    ]},
    { category: 'Genesis v2 on Robinhood Chain', features: [
      { name: 'Genesis v2 Contracts', status: 'Available', desc: 'Registry, Factory, and Coordinator are deployed on Robinhood Chain mainnet' },
      { name: 'CPU-Generated Token Identity', status: 'Available', desc: 'Canonical Native Node output determines each approved Genesis identity' },
      { name: 'Uniswap v4 Liquidity Launch', status: 'Available', desc: 'Creator-signed launch flow with a locked liquidity position and FeeVault accounting' },
      { name: 'Token & Hook Source Verification', status: 'Available', desc: 'Launch completion requires public exact source matches' },
      { name: 'Token Staking / Slashing', status: 'Not available', desc: 'Economic model is conceptual' },
    ]},
    { category: 'Agent Infrastructure', features: [
      { name: 'MCP Server', status: 'Planned', desc: 'Model Context Protocol integration' },
      { name: 'Developer SDK', status: 'Planned', desc: 'Libraries for local agent wrappers' },
    ]}
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle2 className="text-[#d7ff32]" size={16} />;
      case 'Simulated': return <Clock className="text-[#38bdf8]" size={16} />;
      case 'Planned': return <MinusCircle className="text-[#fbbf24]" size={16} />;
      case 'Not available': return <XCircle className="text-[#ef4444]" size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'border-[#d7ff32]/30 bg-[#d7ff32]/10 text-[#d7ff32]';
      case 'Simulated': return 'border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#38bdf8]';
      case 'Planned': return 'border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]';
      case 'Not available': return 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]';
      default: return '';
    }
  };

  return (
    <div className="section-shell py-20 lg:py-32">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-medium tracking-tight text-[#f1f3e8] mb-8">Product Status</h1>
        <p className="text-[#8e9787] mb-16 text-xl leading-relaxed max-w-4xl">
          Isogate is a live technical beta combining an inspectable browser CPU, bounded Native Node execution, canonical result verification, and Genesis v2 contracts on Robinhood Chain. The matrix separates available systems from planned expansion.
        </p>

        <div className="space-y-12">
          {statusMatrix.map((section, idx) => (
            <div key={idx} className="border border-[#d7ff32]/20 rounded-lg overflow-hidden bg-[#0d100b]">
              <div className="bg-[#11150e] border-b border-[#d7ff32]/20 px-8 py-5">
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">{section.category}</h2>
              </div>
              <div className="divide-y divide-[#d7ff32]/10">
                {section.features.map((feature, fIdx) => (
                  <div key={fIdx} className="p-8 grid gap-5 md:grid-cols-[1fr_auto] items-center hover:bg-[#12160f] transition-colors">
                    <div>
                      <h3 className="text-lg text-[#efffca] font-medium">{feature.name}</h3>
                      <p className="text-base text-[#687360] mt-2">{feature.desc}</p>
                    </div>
                    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-mono uppercase tracking-wider ${getStatusColor(feature.status)}`}>
                      {getStatusIcon(feature.status)}
                      {feature.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
