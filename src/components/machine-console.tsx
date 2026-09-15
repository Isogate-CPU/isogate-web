import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, ShieldCheck, Check, ArrowRight, FileText, Search } from 'lucide-react';
import { checkpoints } from '../lib/constants';

interface MachineConsoleProps {
  enabled: boolean;
}

export function MachineConsole({ enabled }: MachineConsoleProps) {
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const [clock, setClock] = useState(2);

  useEffect(() => {
    if (!running || !enabled) return;
    const timer = window.setInterval(() => {
      setCycle((current) => Math.min(32, current + 1));
    }, 1000 / clock);
    return () => window.clearInterval(timer);
  }, [running, clock, enabled]);

  useEffect(() => {
    if (!enabled) setRunning(false);
  }, [enabled]);

  useEffect(() => {
    if (cycle >= 32) setRunning(false);
  }, [cycle]);

  const step = () => setCycle((current) => Math.min(32, current + 1));
  const reset = () => {
    setRunning(false);
    setCycle(0);
  };

  const completeChecks = checkpoints.filter((checkpoint) => cycle >= checkpoint.completeAt).length;
  
  const pc = (0x20 + cycle * 4).toString(16).padStart(4, '0').toUpperCase();
  const accumulator = ((cycle * 13 + 0x42) % 256).toString(16).padStart(2, '0').toUpperCase();
  const ram = ((cycle * 9 + 0x0e) % 256).toString(16).padStart(2, '0').toUpperCase();

  const steps = [
    { num: '01', title: 'SET INPUT', desc: 'Provide input values\n(e.g. 0x42, 0x17)', icon: FileText, activeAt: 0 },
    { num: '02', title: 'RUN SIMULATION', desc: 'Logic flows through\nNAND gate array', icon: Play, activeAt: 8 },
    { num: '03', title: 'INSPECT STATE', desc: 'View registers, memory\nand execution trace', icon: Search, activeAt: 16 },
    { num: '04', title: 'CHECK RESULT', desc: 'Local checkpoint result\nfor this simulation', icon: ShieldCheck, activeAt: 24 }
  ];

  const ramValues = ['00','11','22','33','44','55','66','77','88','99','aa','bb','cc','dd','ee','ff'];
  const activeRamIndex = cycle % 16;

  const laneYs = [30, 60, 90, 120, 150, 180, 210, 240];
  const inputValues = ['0x42', '0x17', '0x00', '0x01', '0xA8', '0x3C', '0x10', '0xFF'];
  const outputValues = ['0xA2', '0x00', '0x7F', '0x00', '0x18', '0xC3', '0x52', '0xE1'];
  const inBoxes = laneYs.map((y, id) => ({ id, y, val: inputValues[id] }));
  
  const outBoxes = laneYs.map((y, id) => ({ id, y, val: outputValues[id] }));

  const signalRoutes = [
    {
      id: 'route-a',
      path: 'M 56 30 L 130 30 C 155 30 155 60 180 60 L 235 60 C 260 60 260 90 285 90 L 340 90 C 365 90 365 120 390 120 L 445 120 C 470 120 470 150 495 150 L 550 150 C 575 150 575 180 600 180 L 650 180 C 675 180 675 210 700 210 L 720 210 C 735 210 735 240 744 240',
      offset: 0,
    },
    {
      id: 'route-b',
      path: 'M 56 240 L 125 240 C 150 240 150 210 175 210 L 245 210 C 270 210 270 180 295 180 L 365 180 C 390 180 390 150 415 150 L 485 150 C 510 150 510 120 535 120 L 605 120 C 630 120 630 90 655 90 L 700 90 C 725 90 725 60 744 60',
      offset: 10,
    },
    {
      id: 'route-c',
      path: 'M 56 90 L 145 90 C 170 90 170 150 195 150 L 270 150 C 295 150 295 120 320 120 L 395 120 C 420 120 420 180 445 180 L 520 180 C 545 180 545 210 570 210 L 635 210 C 660 210 660 180 685 180 L 744 180',
      offset: 19,
    },
    {
      id: 'route-d',
      path: 'M 56 180 L 115 180 C 140 180 140 120 165 120 L 225 120 C 250 120 250 210 275 210 L 335 210 C 360 210 360 60 385 60 L 445 60 C 470 60 470 150 495 150 L 555 150 C 580 150 580 90 605 90 L 665 90 C 690 90 690 150 715 150 L 744 150',
      offset: 26,
    },
  ];

  const activeNodes = [
    { cx: 90, cy: 30, activeAt: 1 },
    { cx: 130, cy: 30, activeAt: 3 },
    { cx: 180, cy: 60, activeAt: 5 },
    { cx: 235, cy: 60, activeAt: 7 },
    { cx: 285, cy: 90, activeAt: 9 },
    { cx: 340, cy: 90, activeAt: 11 },
    { cx: 390, cy: 120, activeAt: 13 },
    { cx: 445, cy: 120, activeAt: 15 },
    { cx: 495, cy: 150, activeAt: 17 },
    { cx: 550, cy: 150, activeAt: 19 },
    { cx: 600, cy: 180, activeAt: 21 },
    { cx: 650, cy: 180, activeAt: 23 },
    { cx: 700, cy: 210, activeAt: 26 },
    { cx: 720, cy: 210, activeAt: 28 },
    { cx: 744, cy: 240, activeAt: 31 },
  ];

  return (
    <div className="border border-[#2a3621] bg-[#0d100b] rounded-md overflow-hidden flex flex-col font-mono text-[#88917d] shadow-2xl" data-testid="machine-console">
      {/* Top Rail */}
      <div className="min-h-12 border-b border-[#2a3621] px-4 py-3 sm:px-5 flex items-center justify-between text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest bg-[#090b08] shrink-0">
        <div className="flex items-center gap-2 text-[#d7ff32]">
          <div className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-[#d7ff32] shadow-[0_0_8px_#d7ff32] animate-pulse' : 'bg-[#35412c]'}`} />
          <span className="font-bold leading-snug">ISOGATE CPU / BROWSER SIMULATION</span>
        </div>
        <div className="hidden sm:block text-[#596252]">
          DETERMINISTIC • NO CHAIN DATA
        </div>
      </div>

      {!enabled && (
        <div className="border-b border-[#f6c453]/25 bg-[#f6c453]/5 px-5 py-3 text-sm text-[#d8d0a8]" role="status">
          Console controls are locked. Connect a wallet on Robinhood Chain above to run this local simulation.
        </div>
      )}
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel: Gate Array */}
        <div className="flex-1 p-4 sm:p-8 flex flex-col relative min-h-[250px] sm:min-h-[350px] lg:min-h-[450px] overflow-hidden">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest text-[#596252] z-10">
            NAND GATE ARRAY / 96 CELLS
          </div>
          
          <div className="flex-1 w-full min-w-0 relative flex items-center justify-center pt-8 pb-8">
            <svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid meet" className="block h-auto w-full max-h-[350px]" aria-label="Eight-lane simulated NAND gate execution field" role="img">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Background */}
              <g opacity="0.15">
                {Array.from({length: 12}).map((_, c) => (
                  <line key={`v-${c}`} x1={90 + c * 55} y1={20} x2={90 + c * 55} y2={260} stroke="#d7ff32" strokeWidth="0.5" strokeDasharray="2 4" />
                ))}
                {laneYs.map((y, r) => (
                  <line key={`h-${r}`} x1={40} y1={y} x2={760} y2={y} stroke="#d7ff32" strokeWidth="0.5" strokeDasharray="2 4" />
                ))}
              </g>

              {/* Inactive Base Paths */}
              {laneYs.map((y, row) => (
                <path key={`lane-${row}`} d={`M 56 ${y} H 744`} fill="none" stroke="#26301f" strokeWidth="1.4" />
              ))}
              {signalRoutes.map((route) => (
                <path key={`base-${route.id}`} d={route.path} fill="none" stroke="#2a3621" strokeWidth="1.5" strokeLinejoin="round" />
              ))}

              {/* Active Glowing Paths */}
              {signalRoutes.map((route, index) => {
                const routeProgress = (cycle + route.offset) % 33;
                return (
                  <path
                    key={`active-${route.id}`}
                    d={route.path}
                    fill="none"
                    stroke="#d7ff32"
                    strokeWidth={index === 0 ? 2 : 1.6}
                    strokeOpacity={index === 0 ? 1 : 0.72}
                    strokeLinejoin="round"
                    pathLength="32"
                    strokeDasharray="32"
                    strokeDashoffset={Math.max(0, 32 - routeProgress)}
                    filter="url(#glow)"
                    className="transition-all duration-300 ease-linear"
                  />
                );
              })}
              {/* Inactive Grid Nodes */}
              {laneYs.map((y, r) => 
                Array.from({length: 12}).map((_, c) => (
                  <circle key={`bg-${r}-${c}`} cx={90 + c * 55} cy={y} r="4" fill="#090b08" stroke="#2a3621" strokeWidth="1" />
                ))
              )}

              {/* Active Nodes Overlays */}
              {activeNodes.map((node, i) => {
                const isActive = cycle >= node.activeAt;
                return (
                  <circle
                    key={`an-${i}`}
                    cx={node.cx}
                    cy={node.cy}
                    r={isActive ? 5 : 4}
                    fill={isActive ? "#d7ff32" : "#0d100b"}
                    stroke={isActive ? "none" : "#2a3621"}
                    strokeWidth="1"
                    filter={isActive ? "url(#glow)" : undefined}
                    className="transition-all duration-300 ease-linear"
                  />
                );
              })}

              {/* IN Boxes */}
              {inBoxes.map(b => {
                const isActive = cycle > 0 && b.id <= Math.min(7, Math.floor(cycle / 4));
                return (
                  <g key={`in-${b.id}`}>
                    <rect x={10} y={b.y - 15} width="46" height="30" rx="2" fill="#090b08" stroke={isActive ? "#d7ff32" : "#2a3621"} strokeWidth="1" className="transition-colors duration-300" />
                    <text x={16} y={b.y - 2} fill="#596252" fontSize="9" fontFamily="monospace" letterSpacing="1">IN {b.id}</text>
                    <text x={16} y={b.y + 11} fill={isActive ? "#d7ff32" : "#e9ebdf"} fontSize="11" fontFamily="monospace" className="transition-colors duration-300">{b.val}</text>
                  </g>
                );
              })}

              {/* OUT Boxes */}
              {outBoxes.map(b => {
                const isActive = cycle >= 25 + b.id;
                return (
                  <g key={`out-${b.id}`}>
                    <rect x={744} y={b.y - 15} width="46" height="30" rx="2" fill="#090b08" stroke={isActive ? "#d7ff32" : "#2a3621"} strokeWidth="1" className="transition-colors duration-300" />
                    <text x={750} y={b.y - 2} fill="#596252" fontSize="9" fontFamily="monospace" letterSpacing="1">OUT {b.id}</text>
                    <text x={750} y={b.y + 11} fill={isActive ? "#d7ff32" : "#e9ebdf"} fontSize="11" fontFamily="monospace" className="transition-colors duration-300">{b.id === 7 && cycle >= 32 ? `0x${accumulator}` : b.val}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-4 left-2 right-2 text-center text-[8px] tracking-wider text-[#596252] sm:bottom-6 sm:text-[10px] sm:tracking-widest">
            LOGIC FLOWS THROUGH NAND GATES (96 CELLS)
          </div>
        </div>

        {/* Right Panel: Controls & State */}
        <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#2a3621] bg-[#090b08] p-6 flex flex-col gap-5">
          <div className="flex gap-2">
            <button 
              onClick={() => setRunning(true)} 
              disabled={!enabled}
              className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-[11px] py-2 rounded-sm transition-all ${
                !enabled
                  ? 'cursor-not-allowed bg-[#35412c] text-[#7e8878]'
                  : running
                  ? 'bg-[#d7ff32] text-[#0a0c0a] shadow-[0_0_12px_rgba(215,255,50,0.3)]' 
                  : 'bg-[#d7ff32]/90 hover:bg-[#d7ff32] text-[#0a0c0a]'
              }`}
            >
              <Play size={12} fill="currentColor" /> <span className="hidden sm:inline">RUN</span>
            </button>
            <button 
              onClick={() => setRunning(false)} 
              disabled={!enabled}
              className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-[11px] py-2 rounded-sm transition-all border ${
                !running 
                  ? 'border-[#2a3621] bg-[#11150e] text-[#e9ebdf]' 
                  : 'border-[#2a3621] text-[#88917d] hover:text-[#d7ff32] hover:border-[#d7ff32]/50 hover:bg-[#d7ff32]/10'
              }`}
            >
              <Pause size={12} fill={!running ? "currentColor" : "none"} /> <span className="hidden sm:inline">PAUSE</span>
            </button>
            <button 
              onClick={step} 
              disabled={!enabled}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#2a3621] text-[#88917d] enabled:hover:border-[#d7ff32]/50 enabled:hover:text-[#d7ff32] enabled:hover:bg-[#d7ff32]/10 disabled:cursor-not-allowed disabled:opacity-45 font-bold text-[11px] py-2 rounded-sm transition-all"
            >
              <SkipForward size={12} /> <span className="hidden sm:inline">STEP</span>
            </button>
            <button 
              onClick={reset} 
              disabled={!enabled}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#2a3621] text-[#88917d] enabled:hover:border-[#d7ff32]/50 enabled:hover:text-[#d7ff32] enabled:hover:bg-[#d7ff32]/10 disabled:cursor-not-allowed disabled:opacity-45 font-bold text-[11px] py-2 rounded-sm transition-all"
            >
              <RotateCcw size={12} /> <span className="hidden sm:inline">RESET</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 py-3 border-b border-[#2a3621]">
            <div className="flex justify-between items-center text-[10px] tracking-widest text-[#596252]">
              <span>CLOCK RATE</span>
              <span className="text-[#d7ff32] font-bold">{clock} HZ</span>
            </div>
            <div className="relative flex items-center h-5">
              <input 
                type="range" 
                min="1" 
                max="8" 
                value={clock} 
                onChange={e => setClock(Number(e.target.value))} 
                disabled={!enabled}
                aria-label="CPU simulation clock rate"
                className="w-full h-1.5 bg-[#2a3621] rounded-full appearance-none outline-none cursor-pointer accent-[#d7ff32]" 
              />
            </div>
            <div className="flex justify-between items-center text-[10px] tracking-widest text-[#596252]">
              <span>1 HZ</span>
              <span>8 HZ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 py-3 border-b border-[#2a3621]">
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">PC</span>
              <span className="text-[#e9ebdf] text-sm break-all">{pc}</span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">CYCLE</span>
              <span className="text-[#e9ebdf] text-sm break-all">{cycle.toString().padStart(4, '0')}</span>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">R0 / ACC</span>
              <span className="text-[#e9ebdf] text-sm break-all">0x{accumulator}</span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">R1 / RAM</span>
              <span className="text-[#e9ebdf] text-sm break-all">0x{ram}</span>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">FLAGS</span>
              <span className="text-[#e9ebdf] text-sm break-all">{cycle % 3 === 0 ? 'Z·C·' : '···'}</span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[10px] text-[#596252] tracking-widest truncate">HALT</span>
              <span className="text-[#e9ebdf] text-sm break-all">{cycle >= 32 ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>

          <div className="py-2 border-b border-[#2a3621]">
            <div className="flex justify-between items-center text-[10px] tracking-widest text-[#596252] mb-3">
              <span>RAM / 16 BYTES</span>
              <span>0x00 - 0x0F</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-px bg-[#2a3621] border border-[#2a3621] rounded-[2px] overflow-hidden">
              {ramValues.map((val, i) => (
                <div key={i} className={`flex items-center justify-center h-8 text-[11px] font-mono transition-colors ${
                  i === activeRamIndex 
                    ? 'bg-[#d7ff32] text-[#0a0c0a] font-bold z-10 shadow-[0_0_6px_#d7ff32]' 
                    : 'bg-[#0a0c0a] text-[#88917d]'
                }`}>
                  {val}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] tracking-widest text-[#596252] mb-3">
              <span>SIMULATED CHECKPOINTS</span>
              <span className="text-[#d7ff32] font-bold">{completeChecks}/5</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#d7ff32]">
              {completeChecks === 5 ? (
                <>
                  <Check size={14} strokeWidth={3} />
                   <span>ALL CHECKPOINTS COMPLETE</span>
                </>
              ) : (
                <>
                  <RotateCcw size={12} className={running ? "animate-spin" : ""} />
                   <span>ADVANCING LOCAL TRACE...</span>
                </>
              )}
            </div>
            <div className="flex gap-1.5 mt-3">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < completeChecks ? 'bg-[#d7ff32] shadow-[0_0_6px_#d7ff32]' : 'bg-[#2a3621]'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Steps Rail */}
      <div className="flex flex-col md:flex-row p-5 lg:p-7 gap-4 md:gap-4 items-center bg-[#090b08] border-t border-[#2a3621]">
        {steps.map((step, i, arr) => {
          const isActive = cycle >= step.activeAt && (i === 3 ? true : cycle < arr[i+1].activeAt);
          const isPast = i < 3 && cycle >= arr[i+1].activeAt;
          
          return (
            <React.Fragment key={step.num}>
              <div className={`flex-1 w-full flex items-start gap-4 p-4 border rounded-sm transition-colors duration-300 ${
                isActive 
                  ? 'border-[#d7ff32]/60 bg-[#d7ff32]/5' 
                  : isPast 
                    ? 'border-[#2a3621] bg-[#0a0c0a] opacity-60' 
                    : 'border-[#2a3621] bg-[#0a0c0a]'
              }`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-[4px] border shrink-0 transition-colors duration-300 ${
                  isActive 
                    ? 'border-[#d7ff32] text-[#d7ff32] bg-[#d7ff32]/10 shadow-[0_0_10px_rgba(215,255,50,0.2)]' 
                    : 'border-[#2a3621] text-[#687360] bg-[#11150e]'
                }`}>
                  <step.icon size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`font-mono text-xs font-bold ${isActive || isPast ? 'text-[#d7ff32]' : 'text-[#687360]'}`}>{step.num}</span>
                    <span className={`font-mono tracking-widest text-[11px] ${isActive ? 'text-[#e9ebdf]' : 'text-[#88917d]'}`}>{step.title}</span>
                  </div>
                  <div className="text-[#596252] font-mono text-[10px] leading-relaxed pr-2 whitespace-pre-line mt-1">
                    {step.desc}
                  </div>
                </div>
              </div>
              {i < 3 && (
                <div className="text-[#2a3621] rotate-90 md:rotate-0 shrink-0 self-center">
                  <ArrowRight size={20} strokeWidth={1.5} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Rail */}
      <div className="h-12 border-t border-[#2a3621] px-5 flex items-center justify-between text-[10px] tracking-widest text-[#596252] bg-[#090b08] font-mono uppercase shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[#e9ebdf] font-bold tracking-[0.2em]">ISOGATE</span>
          <span className="hidden sm:block">LOCAL EXECUTION SIMULATION</span>
        </div>
        <div>
          FIG 01 -- BROWSER SIMULATION
        </div>
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Cycle {cycle}. Program counter {pc}. Accumulator 0x{accumulator}. Halt {cycle >= 32 ? 'true' : 'false'}. {completeChecks} of 5 simulated checkpoints complete.
      </div>
    </div>
  );
}