import { useEffect, useState } from 'react';
import { FileText, Check, Box, Activity, FileCheck, Fingerprint, ExternalLink, FileLock2, Cpu } from 'lucide-react';

function CheckItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-full flex items-center justify-center w-5 h-5 transition-colors duration-300 ${active ? 'bg-[#d7ff32] text-[#0d0e0c]' : 'bg-[#11150e] border border-[#35412c] text-transparent'}`}>
        <Check size={12} strokeWidth={3} />
      </div>
      <span className={`text-[11px] lg:text-xs uppercase tracking-wider font-mono transition-colors duration-300 ${active ? 'text-[#d7ff32]' : 'text-[#687360]'}`}>
        {label}
      </span>
    </div>
  );
}

function ProofItem({ icon: Icon, label, sub, active, highlight = false }: { icon: any; label: string; sub: string; active: boolean; highlight?: boolean }) {
  const isEvm = label.includes('EVM');
  return (
    <div className={`flex items-center justify-between p-3 lg:p-4 rounded border transition-colors duration-300 ${active ? (highlight ? 'border-[#d7ff32] bg-[#1a2115] shadow-[0_0_15px_rgba(215,255,50,0.1)]' : 'border-[#526342] bg-[#11150e]') : 'border-[#26311e] bg-[#0d0e0c]'}`}>
      <div className="flex items-center gap-3.5">
        <Icon size={18} className={`transition-colors duration-300 ${active ? 'text-[#d7ff32]' : 'text-[#35412c]'}`} />
        <div>
          <div className={`text-[11px] lg:text-xs uppercase tracking-wider font-bold transition-colors duration-300 ${active ? 'text-[#e9ebdf]' : 'text-[#596252]'}`}>{label}</div>
          <div className={`text-[9px] lg:text-[10px] font-mono transition-colors duration-300 ${active ? 'text-[#88917d]' : 'text-[#35412c]'}`}>{sub}</div>
        </div>
      </div>
      {isEvm ? (
        <div className="w-5 h-5 rounded-full border border-[#35412c]" />
      ) : (
        <div className={`rounded-full flex items-center justify-center w-5 h-5 transition-colors duration-300 ${active ? 'bg-[#d7ff32] text-[#0d0e0c]' : 'border border-[#35412c] text-transparent'}`}>
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function CertCheck({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
        <div className={`rounded-full flex items-center justify-center w-4 h-4 transition-colors duration-300 ${active ? 'bg-[#0d0e0c] text-[#d7ff32]' : 'bg-[#11150e] border border-[#35412c] text-transparent'}`}>
        <Check size={10} strokeWidth={4} />
      </div>
      <span className={`text-[10px] lg:text-[11px] uppercase font-bold tracking-wider transition-colors duration-300 ${active ? 'text-[#35412c]' : 'text-[#687360]'}`}>
        {label}
      </span>
    </div>
  );
}

function Connector({ active, vertical = false }: { active: boolean; vertical?: boolean }) {
  if (vertical) {
    return (
      <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className="my-[-8px] z-0 drop-shadow-md">
        <path d="M12 0 L12 40" stroke={active ? "#d7ff32" : "#35412c"} strokeWidth="2" strokeDasharray="4 4" className={active ? "animate-flow" : ""} />
        <path d="M7 30 L12 37 L17 30" stroke={active ? "#d7ff32" : "#35412c"} strokeWidth="2" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="mx-[-8px] z-0 drop-shadow-md">
      <path d="M0 12 L40 12" stroke={active ? "#d7ff32" : "#35412c"} strokeWidth="2" strokeDasharray="4 4" className={active ? "animate-flow" : ""} />
      <path d="M30 7 L37 12 L30 17" stroke={active ? "#d7ff32" : "#35412c"} strokeWidth="2" fill="none" />
    </svg>
  );
}

function NandGateSymbol({ active, completed, x, y }: { active: boolean; completed: boolean; x: number; y: number }) {
  const color = active ? "#d7ff32" : completed ? "#71852a" : "#35412c";
  const dropShadow = active ? "drop-shadow(0 0 5px rgba(215,255,50,0.5))" : "none";
  return (
    <g
      transform={`translate(${x}, ${y - 12})`}
      className={active ? "nand-gate-active" : ""}
      style={{ filter: dropShadow, transition: 'filter 0.25s ease, opacity 0.25s ease' }}
    >
      <path d="M4 2 H16 C21.5 2 26 6.5 26 12 C26 17.5 21.5 22 16 22 H4 V2 Z" stroke={color} strokeWidth="1.5" />
      <circle cx="29" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="4" cy="7" r="1.5" fill={color} />
      <circle cx="4" cy="17" r="1.5" fill={color} />
      <circle cx="31.5" cy="12" r="1.5" fill={color} />
    </g>
  );
}

export function ProcessorFlow() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setTick(100);
      return;
    }
    const timer = setInterval(() => setTick((t) => (t >= 119 ? 0 : t + 1)), 100);
    return () => clearInterval(timer);
  }, []);

  const gateStep = tick < 20 ? -1 : Math.min(Math.floor((tick - 20) / 2), 15);
  const gateState = (column: number, row: number) => {
    const gateIndex = column * 4 + row;
    return {
      active: gateStep === gateIndex,
      completed: gateStep > gateIndex,
    };
  };

  const s = {
    parsed: tick >= 4,
    validated: tick >= 8,
    loaded: tick >= 12,
    conn1: tick >= 16,
    inBox: tick >= 20,
    col1: gateStep >= 0,
    col2: gateStep >= 4,
    col3: gateStep >= 8,
    col4: gateStep >= 12,
    conn2: tick >= 54,
    vector: tick >= 60,
    model: tick >= 66,
    shipped: tick >= 72,
    liveness: tick >= 78,
    evm: tick >= 84,
    cert: tick >= 92,
  };

  return (
    <section aria-label="Isogate Execution Path" className="w-full min-w-0 font-sans bg-[#0a0c09] border border-[#d7ff32]/30 shadow-[0_28px_90px_rgba(0,0,0,.55)] p-4 sm:p-6 lg:p-10 relative overflow-hidden text-[#e9ebdf]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#d7ff32]/10" aria-hidden="true" />
      <div className="absolute inset-0 technical-grid opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 sm:mb-10 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="shrink-0 text-[#d7ff32]" size={28} />
            <h2 className="min-w-0 text-lg sm:text-2xl lg:text-4xl font-bold tracking-tight text-[#f1f3e8] break-words">ISOGATE PROCESSOR</h2>
          </div>
          <p className="text-xs lg:text-[13px] uppercase tracking-[0.2em] text-[#88917d] mt-3 font-mono">Verified Execution for AI Agents</p>
        </div>
        <div className="hidden md:block text-right text-[10px] lg:text-[11px] uppercase tracking-[0.2em] text-[#687360] font-mono leading-relaxed">
          Deterministic.<br />Transparent.<br />Replayable.
        </div>
      </div>

      {/* Main Flow */}
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-3 w-full relative z-10">
        
        {/* Panel 1 */}
        <div className="flex-1 w-full lg:w-[320px] lg:flex-none flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#11150e] border border-[#d7ff32]/40 text-[#d7ff32] px-2 py-1 text-sm font-mono">01</span>
            <div className="text-sm uppercase tracking-wider font-bold text-[#e9ebdf]">
              Agent Instruction
              <div className="text-[10px] text-[#687360] mt-1 font-mono tracking-widest">Input &amp; Safety Check</div>
            </div>
          </div>
           <div className="border border-[#d7ff32]/20 rounded bg-[#0d0e0c] p-4 sm:p-6 h-full relative flex flex-col shadow-lg shadow-black/50">
            <div className="flex gap-2 items-center text-[#88917d] mb-5 text-xs lg:text-sm font-bold uppercase tracking-widest border-b border-[#35412c] pb-3">
              <FileText size={18} /> Agent Request
            </div>
            <div className="bg-[#11150e] border border-[#35412c] p-5 rounded text-[#d7ff32] font-mono text-base leading-relaxed mb-6 shadow-inner">
              <span className="text-[#88917d]">IF</span> R2 &gt; 500<br />
              <span className="text-[#88917d]">THEN</span> HALT
            </div>
            <div className="space-y-4 mt-auto">
              <CheckItem label="Parsed" active={s.parsed} />
              <CheckItem label="Validated" active={s.validated} />
              <CheckItem label="Loaded for execution" active={s.loaded} />
            </div>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="hidden lg:flex items-center justify-center">
          <Connector active={s.conn1} />
        </div>
        <div className="flex lg:hidden justify-center">
          <Connector active={s.conn1} vertical />
        </div>

        {/* Panel 2 */}
        <div className="flex-[1.4] w-full min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#11150e] border border-[#d7ff32]/40 text-[#d7ff32] px-2 py-1 text-sm font-mono">02</span>
            <div className="text-sm uppercase tracking-wider font-bold text-[#e9ebdf]">
              NAND Gate Array
              <div className="text-[10px] text-[#687360] mt-1 font-mono tracking-widest">Deterministic Execution</div>
            </div>
          </div>
          <div className="border border-[#d7ff32]/20 rounded bg-[#0d0e0c] p-5 lg:p-8 h-full relative flex items-center justify-center overflow-hidden shadow-lg shadow-black/50">
            <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
            
            <div className="relative w-full min-w-0 max-w-[440px] aspect-[4/3]">
              <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-xl" aria-hidden="true">
                {/* Background wires */}
                {[37.5, 112.5, 187.5, 262.5].map((y, r) => (
                  <g key={`h-${r}`}>
                    <line x1="40" y1={y} x2="100" y2={y} stroke={s.col1 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />
                    <line x1="140" y1={y} x2="180" y2={y} stroke={s.col2 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />
                    <line x1="220" y1={y} x2="260" y2={y} stroke={s.col3 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />
                    <line x1="300" y1={y} x2="340" y2={y} stroke={s.col4 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />
                    <line x1="380" y1={y} x2="400" y2={y} stroke={s.col4 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />
                  </g>
                ))}

                {/* Diagonal crosses */}
                <path d="M 140 37.5 C 160 37.5, 160 112.5, 180 112.5" fill="none" stroke={s.col2 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                <path d="M 140 187.5 C 160 187.5, 160 112.5, 180 112.5" fill="none" stroke={s.col2 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                <path d="M 220 112.5 C 240 112.5, 240 37.5, 260 37.5" fill="none" stroke={s.col3 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                <path d="M 220 262.5 C 240 262.5, 240 187.5, 260 187.5" fill="none" stroke={s.col3 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                <path d="M 300 37.5 C 320 37.5, 320 112.5, 340 112.5" fill="none" stroke={s.col4 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                <path d="M 300 187.5 C 320 187.5, 320 262.5, 340 262.5" fill="none" stroke={s.col4 ? "#d7ff32" : "#35412c"} strokeWidth="1" opacity="0.6" className="transition-colors duration-300" />
                
                {/* Vertical manifold */}
                <line x1="40" y1="37.5" x2="40" y2="262.5" stroke={s.col1 ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" />

                {/* IN Box */}
                <g transform="translate(10, 138)">
                  <rect x="0" y="0" width="30" height="24" rx="4" fill="#11150e" stroke={s.inBox ? "#d7ff32" : "#35412c"} strokeWidth="1.5" className="transition-colors duration-300" style={{ filter: s.inBox ? 'drop-shadow(0 0 6px rgba(215,255,50,0.5))' : 'none' }} />
                  <text x="15" y="16" fill={s.inBox ? "#d7ff32" : "#687360"} fontSize="10" fontFamily="var(--app-font-mono, monospace)" fontWeight="bold" textAnchor="middle" className="transition-colors duration-300">IN</text>
                </g>

                {/* Gates */}
                {[37.5, 112.5, 187.5, 262.5].map((y, r) => (
                  <g key={`gates-${r}`}>
                    <NandGateSymbol {...gateState(0, r)} x={100} y={y} />
                    <NandGateSymbol {...gateState(1, r)} x={180} y={y} />
                    <NandGateSymbol {...gateState(2, r)} x={260} y={y} />
                    <NandGateSymbol {...gateState(3, r)} x={340} y={y} />
                  </g>
                ))}
              </svg>
              
              <div className="absolute top-3 right-5 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-[#596252] font-mono">
                NAND Gates <span className="mx-2">•</span> Parallel + Deterministic
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-[#596252] font-mono">
                Cycle {String(Math.floor((tick * 24) % 1000)).padStart(5, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Connector 2 */}
        <div className="hidden lg:flex items-center justify-center">
          <Connector active={s.conn2} />
        </div>
        <div className="flex lg:hidden justify-center">
          <Connector active={s.conn2} vertical />
        </div>

        {/* Panel 3 */}
        <div className="flex-1 w-full lg:w-[340px] lg:flex-none flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#11150e] border border-[#d7ff32]/40 text-[#d7ff32] px-2 py-1 text-sm font-mono">03</span>
            <div className="text-sm uppercase tracking-wider font-bold text-[#e9ebdf]">
              Proof Gate
              <div className="text-[10px] text-[#687360] mt-1 font-mono tracking-widest">Generate Verifiable Output</div>
            </div>
          </div>
          <div className="border border-[#d7ff32]/20 rounded bg-[#0d0e0c] p-5 h-full flex flex-col justify-center gap-3 shadow-lg shadow-black/50">
            <ProofItem icon={Box} label="Vector" sub="Execution state vector" active={s.vector} />
            <ProofItem icon={Activity} label="Model" sub="Model output" active={s.model} />
            <ProofItem icon={FileCheck} label="Shipped" sub="Execution completed" active={s.shipped} highlight />
            <ProofItem icon={Activity} label="Liveness" sub="System liveness proof" active={s.liveness} />
            <ProofItem icon={Fingerprint} label="EVM (Optional)" sub="On-chain verification" active={s.evm} />
          </div>
        </div>

      </div>

      {/* Row 2: Certificate */}
      <div className="mt-8 lg:mt-12 flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-[#11150e] border border-[#d7ff32]/40 text-[#d7ff32] px-2 py-1 text-sm font-mono">04</span>
          <div className="text-sm uppercase tracking-wider font-bold text-[#e9ebdf]">
            Replayable Certificate
            <div className="text-[10px] text-[#687360] mt-1 font-mono tracking-widest">Anyone can verify</div>
          </div>
        </div>
        
        <div className={`transition-all duration-700 overflow-hidden border ${s.cert ? 'border-[#d7ff32] bg-[#d7ff32] shadow-[0_0_40px_rgba(215,255,50,0.2)]' : 'border-[#26311e] bg-[#0d0e0c]'} rounded-lg p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8`}>
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
             <div className={`p-5 rounded-md bg-[#0a0c09] transition-colors duration-500 ${s.cert ? 'text-[#d7ff32] shadow-inner' : 'text-[#35412c]'}`}>
               <FileLock2 size={36} />
             </div>
             <div>
               <div className={`text-[11px] lg:text-xs uppercase font-bold tracking-[0.2em] transition-colors duration-500 ${s.cert ? 'text-[#35412c]' : 'text-[#596252]'}`}>Proof</div>
               <div className={`break-all font-mono text-xl sm:text-3xl lg:text-4xl font-medium tracking-wide mt-2 transition-colors duration-500 ${s.cert ? 'text-[#0d0e0c]' : 'text-[#88917d]'}`}>0x7A91...E4663</div>
               <div className={`text-[10px] lg:text-[11px] uppercase tracking-[0.15em] mt-3 transition-colors duration-500 font-mono ${s.cert ? 'text-[#425235]' : 'text-[#425235]'}`}>Deterministic Trace / Replay Anytime</div>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12">
             <div className="flex flex-col gap-4 border-l border-transparent sm:border-current sm:pl-10 transition-colors duration-500" style={{ borderLeftColor: s.cert ? 'rgba(53,65,44,0.3)' : 'transparent' }}>
               <CertCheck active={s.cert} label="Open" />
               <CertCheck active={s.cert} label="Verifiable" />
               <CertCheck active={s.cert} label="Tamper-proof" />
             </div>
             <button className={`flex items-center gap-2.5 border px-8 py-4 text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded ${s.cert ? 'border-[#0a0c09] text-[#e9ebdf] bg-[#0a0c09] hover:bg-[#1a2115] hover:text-[#d7ff32] shadow-lg' : 'border-[#35412c] text-[#596252] pointer-events-none'}`} disabled={!s.cert}>
               <ExternalLink size={18} /> Verify
             </button>
           </div>
        </div>
      </div>
    </section>
  );
}
