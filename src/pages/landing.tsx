import { ArrowDownRight, CircleCheck, Activity, Braces, Network, Terminal, LockKeyhole, Layers3, Cpu, ScanLine, ShieldCheck, ChevronDown, ArrowRight, Database, Clock3, GitBranch, Binary } from 'lucide-react';
import { ProcessorFlow } from '../components/processor-flow';
import { MachineConsole } from '../components/machine-console';
import { FaqSection } from '../components/faq-section';
import { checkpoints, opcodes, comparisonRows } from '../lib/constants';
import { SectionLabel, ArrowLink } from '../components/ui-utils';
import React, { useEffect } from 'react';

export function LandingPage() {
  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <section id="processor" className="relative isolate overflow-hidden scroll-mt-16 border-b border-[#d7ff32]/20 bg-[#0d0e0c]" aria-labelledby="hero-heading">
        <div className="pointer-events-none absolute inset-0 technical-grid opacity-30" aria-hidden="true" />
        <div className="section-shell relative py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16">
            <div className="reveal flex-1 min-w-0">
              <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[.18em] text-[#d7ff32]"><span className="status-pulse h-2 w-2 rounded-full bg-[#d7ff32]" /> Verification network / chain 4663</div>
              <h1 id="hero-heading" className="text-[clamp(3.5rem,6.5vw,7rem)] xl:text-[7.5rem] font-semibold leading-[.95] tracking-[-.065em] text-[#f1f3e8]">The CPU that shows<br />how it <span className="text-[#d7ff32]">computes.</span></h1>
            </div>
            <div className="reveal reveal-2 pb-1 lg:pb-4 w-full lg:w-[420px] xl:w-[480px] shrink-0">
              <p className="text-xl leading-relaxed text-[#9aa291]">Isogate is a deterministic virtual CPU that turns fixed decision logic into gate-level execution anyone can replay and inspect locally. The engine now powers the Genesis launchpad live on Robinhood Chain.</p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a href="?page=genesis" className="inline-flex items-center gap-3 bg-[#d7ff32] px-6 py-4 font-mono text-sm font-medium uppercase tracking-[.1em] text-[#0d0e0c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e4ff74]" data-testid="link-hero-genesis">Open Genesis <ArrowDownRight size={18} /></a>
                <ArrowLink href="?page=home#mechanism">Read the mechanism</ArrowLink>
              </div>
            </div>
          </div>

          <div className="reveal reveal-3 relative mt-16">
            <ProcessorFlow />
          </div>

          <div className="reveal reveal-3 grid grid-cols-3 border-b border-x border-[#d7ff32]/25 mt-12">
            {[['96', 'demo gates'], ['4663', 'target chain ID'], ['5', 'replay checks']].map(([value, label]) => <div key={label} className="border-r border-[#d7ff32]/20 px-6 py-5 last:border-0 sm:px-8"><div className="font-mono text-lg text-[#edffac] sm:text-xl">{value}</div><div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#687360] sm:text-[11px]">{label}</div></div>)}
          </div>
        </div>
      </section>

      <section id="machine" className="section-shell scroll-mt-24 py-24 lg:py-32" aria-labelledby="machine-heading">
        <SectionLabel number="01" children="The machine" />
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><h2 id="machine-heading" className="max-w-3xl text-[2.5rem] font-medium leading-[1.02] tracking-[-.04em] text-[#f1f3e8] sm:text-6xl">Watch a computation<br /><span className="text-[#d7ff32]">become inspectable.</span></h2></div>
          <p className="max-w-md text-base leading-relaxed text-[#8e9787]">This is a local deterministic simulation of the Isogate execution model. Step the trace. Pause it. Reset it. The checkpoint result changes because the state changes.</p>
        </div>
        <MachineConsole enabled />
      </section>

      <section className="border-y border-[#d7ff32]/20 bg-[#11130f]" aria-labelledby="problem-heading">
        <div className="section-shell py-24 lg:py-28">
          <SectionLabel number="02" children="The missing layer" />
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
            <div><h2 id="problem-heading" className="text-5xl font-medium leading-tight tracking-[-.04em] sm:text-6xl">Agents are making decisions.<br /><span className="text-[#d7ff32]">Who checks the trail?</span></h2><p className="mt-8 max-w-lg text-lg text-[#8e9787] leading-relaxed">Model output is only one part of an autonomous transaction. Thresholds, permissions, balances, retries, and state transitions decide what actually happens.</p></div>
            <div className="grid gap-px border border-[#d7ff32]/20 bg-[#d7ff32]/20 sm:grid-cols-2">
              {[
                [<Terminal key="1" size={20} />, '01', 'Black-box agents', 'A final output does not show the rules that produced it.'],
                [<Activity key="2" size={20} />, '02', 'Self-reported compute', 'Capacity and revenue claims need an independent trail.'],
                [<Braces key="3" size={20} />, '03', 'zkML is not the whole story', 'Model proofs can miss the surrounding decision logic.'],
                [<Network key="4" size={20} />, '04', 'A new asset surface', 'Tokenized stocks need accountable automation, not trust-me software.'],
              ].map(([icon, number, title, text]) => <article key={number as string} className="bg-[#11130f] p-8 transition-colors hover:bg-[#181c14]"><div className="mb-8 flex items-center justify-between text-[#d7ff32]">{icon}<span className="font-mono text-xs text-[#687360]">{number}</span></div><h3 className="text-xl text-[#efffca]">{title as string}</h3><p className="mt-3 text-base leading-relaxed text-[#7e8878]">{text as string}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section id="mechanism" className="section-shell scroll-mt-24 py-24 lg:py-32" aria-labelledby="mechanism-heading">
        <SectionLabel number="03" children="How the gate works" />
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <h2 id="mechanism-heading" className="text-5xl font-medium leading-tight tracking-[-.04em] sm:text-6xl text-[#f1f3e8]">One execution.<br /><span className="text-[#d7ff32]">Five independent checks.</span></h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-base leading-relaxed text-[#8e9787] sm:text-lg">The browser simulation produces one deterministic gate trace. Five verification perspectives inspect that trace before a local checkpoint result is shown. No cryptographic proof is produced.</p>
            <div className="mt-6">
              <ArrowLink href="?page=home#spec">Inspect the ISA</ArrowLink>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col border border-[#2a3621] bg-[#0d100b] shadow-2xl rounded-[3px]">
          
          <div className="h-12 border-b border-[#2a3621] px-5 flex items-center justify-between text-[11px] tracking-widest bg-[#090b08] shrink-0 font-mono">
            <div className="flex items-center gap-2 text-[#d7ff32]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_8px_#d7ff32] animate-pulse" />
              <span className="font-bold">INSPECTION ARRAY</span>
            </div>
            <div className="hidden sm:block text-[#596252]">
              PARALLEL VERIFICATION TOPOLOGY
            </div>
          </div>

          <div className="flex flex-col lg:flex-row relative">
            <div className="lg:w-[380px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#2a3621] bg-[#0a0c0a] relative justify-center items-center lg:items-start text-center lg:text-left p-10">
              <div className="w-14 h-14 border border-[#d7ff32]/40 bg-[#d7ff32]/10 text-[#d7ff32] flex items-center justify-center mb-8 shadow-[inset_0_0_15px_rgba(215,255,50,0.15)] relative">
                <div className="absolute inset-0 border border-[#d7ff32] animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                <Binary size={26} />
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#596252] mb-4">SOURCE MATERIAL</div>
              <div className="text-2xl sm:text-3xl text-[#e9ebdf] tracking-tight font-medium leading-[1.1]">DETERMINISTIC<br />NAND TRACE</div>
              <div className="mt-5 font-mono text-[11px] leading-[1.7] text-[#88917d] max-w-[280px]">
                BROWSER-DEMO LOGIC PATH FROM THE ISOGATE VIRTUAL CPU. VISUALIZED FOR INSPECTION.
              </div>

              <div className="mt-auto pt-10 w-full hidden lg:block">
                <div className="font-mono text-[9px] tracking-widest text-[#435234] mb-3 uppercase">Raw export stream</div>
                <div className="w-full border border-[#2a3621] bg-[#090b08] p-4 font-mono text-[10px] text-[#596252] overflow-hidden h-[100px] relative leading-relaxed">
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#090b08] to-transparent z-10" />
                  <div className="opacity-70 whitespace-pre">
                    &gt; trace_start()<br/>
                    [PC:0000] R0=00 R1=00<br/>
                    [PC:0004] R0=42 R1=17<br/>
                    [PC:0008] R0=59 R1=17
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute right-[-3px] top-1/2 w-1.5 h-1.5 rounded-full -translate-y-1/2 bg-[#d7ff32] shadow-[0_0_8px_#d7ff32] z-10" />
              <div className="hidden lg:block absolute right-0 top-1/2 w-12 h-px -translate-y-1/2 bg-[#d7ff32]" />
              
              <div className="hidden lg:block absolute right-[-1px] top-1/2 w-px h-48 -translate-y-1/2 bg-gradient-to-b from-[#2a3621] via-[#d7ff32]/60 to-[#2a3621]" />
            </div>

            <div className="flex-1 flex flex-col relative z-0 bg-[#0d100b]">
              {checkpoints.map((checkpoint, i) => {
                const icons = [<Braces key="1" size={16} />, <GitBranch key="2" size={16} />, <Cpu key="3" size={16} />, <Activity key="4" size={16} />, <ShieldCheck key="5" size={16} />];
                const labels = ['Arithmetic coverage', 'Cross-model agreement', 'Production path', 'Runtime stability', 'On-chain parity'];
                const isPlanned = i === 4;

                return (
                  <div key={checkpoint.number} className="group flex flex-col lg:flex-row items-start lg:items-center relative border-b border-[#2a3621] last:border-0 p-6 lg:pl-12 lg:pr-8 lg:py-8 transition-colors hover:bg-[#11150e]">
                    
                    <div className={`hidden lg:block absolute left-0 top-1/2 w-10 h-px -translate-y-1/2 transition-colors duration-300 ${isPlanned ? 'bg-[#2a3621]' : 'bg-[#435234] group-hover:bg-[#d7ff32]'}`} />
                    <div className={`hidden lg:block absolute left-[-3px] top-1/2 w-1.5 h-1.5 rounded-full -translate-y-1/2 transition-colors duration-300 ${isPlanned ? 'bg-[#2a3621]' : 'bg-[#435234] group-hover:bg-[#d7ff32] group-hover:shadow-[0_0_5px_#d7ff32]'}`} />

                    <div className="w-full flex items-center justify-between lg:hidden mb-5 pb-5 border-b border-[#2a3621]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 border flex items-center justify-center transition-all ${isPlanned ? 'border-[#2a3621] text-[#596252] bg-[#0a0c0a]' : 'border-[#435234] text-[#d7ff32] bg-[#11150e] shadow-[inset_0_0_10px_rgba(215,255,50,0.05)]'}`}>
                          {icons[i]}
                        </div>
                        <div className="font-mono text-[11px] text-[#596252]">{checkpoint.number} // 05</div>
                      </div>
                      <div>
                        {isPlanned ? (
                          <span className="font-mono text-[10px] border border-[#2a3621] text-[#596252] px-3 py-1.5 bg-[#0a0c0a]">CONCEPTUAL</span>
                        ) : (
                          <span className="font-mono text-[10px] border border-[#d7ff32]/30 text-[#d7ff32] px-3 py-1.5 bg-[#d7ff32]/5 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> SIMULATED</span>
                        )}
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-5 w-[15%] shrink-0 relative z-10">
                      <div className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${isPlanned ? 'border-[#2a3621] text-[#596252] bg-[#0a0c0a]' : 'border-[#435234] text-[#d7ff32] bg-[#11150e] group-hover:border-[#d7ff32] group-hover:shadow-[0_0_15px_rgba(215,255,50,0.15)] shadow-[inset_0_0_10px_rgba(215,255,50,0.05)]'}`}>
                        {icons[i]}
                      </div>
                      <div className="font-mono text-[11px] text-[#596252]">{checkpoint.number}</div>
                    </div>

                    <div className="lg:w-[35%] shrink-0 lg:pr-8 mb-4 lg:mb-0">
                      <div className={`font-mono text-[10px] uppercase tracking-[0.15em] mb-2 ${isPlanned ? 'text-[#596252]' : 'text-[#d7ff32]'}`}>
                        {labels[i]}
                      </div>
                      <div className={`text-lg tracking-tight ${isPlanned ? 'text-[#88917d]' : 'text-[#e9ebdf]'}`}>
                        {checkpoint.title}
                      </div>
                    </div>

                    <div className={`flex-1 font-mono text-[11px] leading-relaxed ${isPlanned ? 'text-[#4b5444]' : 'text-[#596252]'} lg:pr-4`}>
                      {checkpoint.detail}
                    </div>

                    <div className="hidden lg:flex w-28 shrink-0 justify-end">
                      {isPlanned ? (
                        <span className="font-mono text-[10px] border border-[#2a3621] text-[#596252] px-3 py-1.5 bg-[#0a0c0a]">CONCEPTUAL</span>
                      ) : (
                        <span className="font-mono text-[10px] border border-[#d7ff32]/30 text-[#d7ff32] px-3 py-1.5 bg-[#d7ff32]/5 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> SIMULATED</span>
                      )}
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-12 border-t border-[#2a3621] px-6 flex items-center justify-between text-[11px] tracking-widest bg-[#090b08] shrink-0 font-mono">
            <div className="flex gap-4">
              <span className="text-[#88917d]">RESULT</span>
              <span className="text-[#e9ebdf]">LOCAL CHECKPOINT RESULT</span>
            </div>
            <div className="flex items-center gap-2 text-[#d7ff32]">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">LOCAL VISUALIZATION</span>
            </div>
          </div>

        </div>
      </section>

      <section id="spec" className="scroll-mt-24 border-y border-[#d7ff32]/20 bg-[#11130f]" aria-labelledby="spec-heading">
        <div className="section-shell py-24 lg:py-32">
          <SectionLabel number="04" children="Machine reference" />
          <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h2 id="spec-heading" className="text-5xl font-medium tracking-[-.04em] sm:text-6xl text-[#f1f3e8]">
                A small ISA.<br /><span className="text-[#d7ff32]">A precise surface.</span>
              </h2>
            </div>
            <div className="max-w-lg text-lg leading-relaxed text-[#8e9787]">
              The Isogate execution model relies on a heavily constrained instruction set. A smaller surface area guarantees deterministic logic paths across any runtime environment.
            </div>
          </div>
          
          <div className="mt-14 flex flex-col border border-[#2a3621] bg-[#0d100b] shadow-2xl rounded-[3px]">
            {/* Header rail */}
            <div className="h-12 border-b border-[#2a3621] px-5 flex items-center justify-between text-[11px] tracking-widest bg-[#090b08] shrink-0 font-mono">
              <div className="flex items-center gap-3 text-[#d7ff32]">
                <Cpu size={14} />
                <span className="font-bold">INSTRUCTION SET ARCHITECTURE</span>
              </div>
              <div className="hidden sm:block text-[#596252]">
                ISOGATE BROWSER SIMULATION
              </div>
            </div>

            <div className="flex flex-col lg:flex-row relative">
              {/* Left panel: Machine Facts */}
              <div className="lg:w-[320px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#2a3621] bg-[#0a0c0a] relative p-8 lg:p-10">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#596252] mb-8">MACHINE PARAMETERS</div>
                
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#596252] tracking-widest uppercase">Word width</span>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl text-[#e9ebdf] tracking-tight font-medium leading-[1]">16</span>
                      <span className="text-[#88917d] font-mono text-[11px] mb-0.5">BITS</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#2a3621]" />

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#596252] tracking-widest uppercase">Registers</span>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl text-[#e9ebdf] tracking-tight font-medium leading-[1]">8</span>
                      <span className="text-[#88917d] font-mono text-[11px] mb-0.5">R0—R7</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#2a3621]" />

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-[#596252] tracking-widest uppercase">Address space</span>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl text-[#e9ebdf] tracking-tight font-medium leading-[1]">256</span>
                      <span className="text-[#88917d] font-mono text-[11px] mb-0.5">BYTES</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-10">
                  <div className="border border-[#2a3621] bg-[#090b08] p-5 flex flex-col gap-3 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-8 h-8 bg-gradient-to-bl from-[#d7ff32]/10 to-transparent transition-opacity group-hover:opacity-100 opacity-50" />
                    <span className="text-[10px] text-[#d7ff32] font-mono tracking-widest uppercase">Target Constraint</span>
                    <span className="text-[11px] text-[#88917d] font-mono leading-relaxed">Minimal deterministic surface area for independent verifiable replay.</span>
                  </div>
                </div>
              </div>

              {/* Right panel: Opcodes */}
              <div className="flex-1 flex flex-col relative z-0 bg-[#0d100b]">
                <div className="hidden lg:grid grid-cols-[120px_100px_1fr_1fr_40px] items-center border-b border-[#2a3621] bg-[#0a0c0a] px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-[#596252]">
                  <span>Opcode</span>
                  <span>Mnemo</span>
                  <span>Operation</span>
                  <span>Word format</span>
                  <span></span>
                </div>
                
                {opcodes.map(([code, mnemonic, operation, format], index) => (
                  <details key={code} className="group border-b border-[#2a3621] last:border-0 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="relative grid cursor-pointer list-none grid-cols-1 lg:grid-cols-[120px_100px_1fr_1fr_40px] items-start lg:items-center gap-y-3 px-8 py-6 transition-colors hover:bg-[#11150e] outline-none focus-visible:bg-[#11150e] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#d7ff32]">
                      
                      {/* Opcode */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base text-[#d7ff32]">{code}</span>
                      </div>

                      {/* Mnemonic */}
                      <div className="font-mono text-xs text-[#e9ebdf] tracking-wider font-bold">
                        {mnemonic}
                      </div>

                      {/* Operation */}
                      <div className="text-base text-[#88917d] tracking-tight">
                        {operation}
                      </div>

                      {/* Format */}
                      <div className="font-mono text-[11px] text-[#596252] flex items-center justify-between lg:justify-start">
                        <span className="lg:hidden text-[10px] tracking-widest uppercase">Format: </span>
                        {format}
                      </div>

                      {/* Expand Icon */}
                      <div className="absolute right-6 top-6 lg:static lg:flex justify-end text-[#435234] group-hover:text-[#d7ff32] transition-colors">
                        <div className="w-5 h-5 border border-current rounded-[2px] flex items-center justify-center relative">
                          <div className="w-2.5 h-px bg-current transition-transform duration-300" />
                          <div className="w-px h-2.5 bg-current absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                        </div>
                      </div>
                    </summary>
                    
                    <div className="px-8 pb-8 pt-3 lg:pl-[252px] font-mono text-[11px] leading-relaxed text-[#596252] bg-[#0a0c0a] border-t border-[#2a3621]/50">
                      <div className="flex items-center gap-3 mb-4 text-[#88917d]">
                        <Terminal size={14} />
                        <span className="tracking-widest uppercase text-[10px]">Execution path</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className="border border-[#2a3621] px-2 py-1 bg-[#090b08] text-[#88917d]">decode</span>
                        <ArrowRight size={10} className="text-[#435234]" />
                        <span className="border border-[#2a3621] px-2 py-1 bg-[#090b08] text-[#88917d]">reg_read</span>
                        <ArrowRight size={10} className="text-[#435234]" />
                        <span className="border border-[#d7ff32]/30 px-2 py-1 bg-[#d7ff32]/5 text-[#d7ff32]">nand_eval</span>
                        <ArrowRight size={10} className="text-[#435234]" />
                        <span className="border border-[#2a3621] px-2 py-1 bg-[#090b08] text-[#88917d]">flag_write</span>
                        <ArrowRight size={10} className="text-[#435234]" />
                        <span className="border border-[#2a3621] px-2 py-1 bg-[#090b08] text-[#88917d]">pc_advance</span>
                      </div>
                      <div className="mt-5 text-[#596252] border-l border-[#d7ff32]/30 pl-3">
                        Deterministic gate trace verified for <span className="text-[#e9ebdf] font-bold">{mnemonic}</span> input states. Replayable locally via the console array.
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="genesis" className="section-shell scroll-mt-24 py-24 lg:py-32" aria-labelledby="genesis-heading">
        <SectionLabel number="05" children="Mainnet application" />
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <h2 id="genesis-heading" className="text-5xl font-medium tracking-[-.04em] sm:text-6xl text-[#f1f3e8]">
              Isogate Genesis.<br /><span className="text-[#d7ff32]">Live on Chain 4663.</span>
            </h2>
          </div>
          <div className="max-w-xl text-lg leading-relaxed text-[#8e9787]">
            The first application of deterministic verification is a token launchpad. No server holds your keys. No token exists until a Native Node generates a canonical identity and your wallet signs the deployment.
          </div>
        </div>

        <div className="mt-16 flex flex-col border border-[#2a3621] bg-[#0d100b] shadow-2xl rounded-[3px] overflow-hidden relative">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d7ff32]/5 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

          <div className="h-12 border-b border-[#2a3621] px-5 flex items-center justify-between text-[11px] tracking-widest bg-[#090b08] shrink-0 font-mono relative z-10">
            <div className="flex items-center gap-3 text-[#d7ff32]">
              <Cpu size={14} />
              <span className="font-bold">GENESIS LAUNCH PROTOCOL</span>
            </div>
            <div className="hidden sm:block text-[#596252]">ROBINHOOD CHAIN INTEGRATION</div>
          </div>

          <div className="grid lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#2a3621] bg-[#0a0c0a]/80 relative z-10">
            <div className="p-6 lg:p-8 flex flex-col relative group hover:bg-[#11150e] transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff32]/0 group-hover:via-[#d7ff32]/40 to-transparent transition-all duration-500" />
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between text-[#d7ff32] gap-3">
                <Cpu size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-mono text-[10px] border border-[#d7ff32]/20 bg-[#d7ff32]/5 text-[#d7ff32] px-2 py-1 flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> PHASE 01</span>
              </div>
              <h3 className="text-xl font-medium text-[#e9ebdf] mb-3 tracking-tight">Deterministic Identity</h3>
              <p className="text-sm text-[#88917d] leading-relaxed">
                A wallet-bound Native Node executes a bounded job to produce a canonical RGB565 matrix.
                The server independently recomputes to guarantee truth.
              </p>
            </div>

            <div className="p-6 lg:p-8 flex flex-col relative group hover:bg-[#11150e] transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff32]/0 group-hover:via-[#d7ff32]/40 to-transparent transition-all duration-500" />
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between text-[#d7ff32] gap-3">
                <Database size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-mono text-[10px] border border-[#d7ff32]/20 bg-[#d7ff32]/5 text-[#d7ff32] px-2 py-1 flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> PHASE 02</span>
              </div>
              <h3 className="text-xl font-medium text-[#e9ebdf] mb-3 tracking-tight">Immutable Record</h3>
              <p className="text-sm text-[#88917d] leading-relaxed">
                The server creates and pins the canonical PNG to IPFS via Pinata. A verifier proof binds the exact
                CPU identity, image digest, creator, and immutable logo URI.
              </p>
            </div>

            <div className="p-6 lg:p-8 flex flex-col relative group hover:bg-[#11150e] transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff32]/0 group-hover:via-[#d7ff32]/40 to-transparent transition-all duration-500" />
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between text-[#d7ff32] gap-3">
                <Layers3 size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-mono text-[10px] border border-[#d7ff32]/20 bg-[#d7ff32]/5 text-[#d7ff32] px-2 py-1 flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> PHASE 03</span>
              </div>
              <h3 className="text-xl font-medium text-[#e9ebdf] mb-3 tracking-tight">Creator Signed Launch</h3>
              <p className="text-sm text-[#88917d] leading-relaxed">
                The creator executes Registry verification, Factory deployment, and liquidity initialization
                directly from their wallet. Genesis v2 final supply is 999M after the canonical 1M zero-address burn. The pool uses a fixed 34,500 × Q96 ratio and a 1% static Uniswap v4 fee.
              </p>
            </div>

            <div className="p-6 lg:p-8 flex flex-col relative group hover:bg-[#11150e] transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff32]/0 group-hover:via-[#d7ff32]/40 to-transparent transition-all duration-500" />
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between text-[#d7ff32] gap-3">
                <LockKeyhole size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-mono text-[10px] border border-[#d7ff32]/20 bg-[#d7ff32]/5 text-[#d7ff32] px-2 py-1 flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_5px_#d7ff32]" /> PHASE 04</span>
              </div>
              <h3 className="text-xl font-medium text-[#e9ebdf] mb-3 tracking-tight">Locked Finality</h3>
              <p className="text-sm text-[#88917d] leading-relaxed">
                1M tokens burned permanently at genesis. Liquidity is locked. 12-block reconciliation finality routes
                trading fees to an immutable FeeVault (70% creator / 30% protocol).
              </p>
            </div>
          </div>

          <div className="border-t border-[#2a3621] bg-[#070906] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="font-mono text-[11px] text-[#596252] max-w-sm uppercase tracking-wider leading-relaxed border-l border-[#d7ff32]/30 pl-4">
              Direct access to live launch surfaces. Wallet required for generation and claims.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="?page=genesis" className="inline-flex items-center gap-3 bg-[#d7ff32] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] transition-all hover:bg-[#e4ff74] hover:shadow-[0_0_20px_rgba(215,255,50,0.4)]">
                Open Genesis <ArrowDownRight size={16} />
              </a>
              <a href="?page=creator-dashboard" className="inline-flex items-center gap-2 border border-[#d7ff32] px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-[#d7ff32] transition-colors hover:bg-[#d7ff32] hover:text-[#0d0e0c]">
                Creator Dashboard
              </a>
              <a href="?page=genesis-launches" className="inline-flex items-center gap-2 border border-[#35412c] px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-[#88917d] transition-colors hover:border-[#d7ff32] hover:text-[#d7ff32]">
                Public CPU Launches
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-24 lg:py-32" aria-labelledby="agent-heading">
        <SectionLabel number="06" children="Agent execution" />
        <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <div><h2 id="agent-heading" className="text-5xl font-medium leading-tight tracking-[-.04em] sm:text-6xl">Planned verification<br /><span className="text-[#d7ff32]">before execution.</span></h2><p className="mt-8 max-w-lg text-lg leading-relaxed text-[#8e9787]">The intended future flow gives an agent a scoped session key, evaluates its logic, and records a verifiable result before a transaction. This infrastructure is not connected in the current mainnet deployment.</p><div className="mt-10 border-l-2 border-[#d7ff32] pl-6 font-mono text-sm leading-relaxed text-[#9ba493]">CONCEPTUAL SCOPE<br /><span className="text-[#edffac]">swap ≤ $500 / day</span><br /><span className="text-[#edffac]">assets: RHO, ETF-01</span></div></div>
          <div className="border border-[#d7ff32]/25">
            <div className="grid grid-cols-[48px_1fr] border-b border-[#d7ff32]/20 bg-[#181c14] p-5 font-mono text-[11px] uppercase tracking-wider text-[#687360]"><span>#</span><span>Execution trail</span></div>
            {['Planned scoped key authorization', 'Local gate-level state evaluation', 'Planned commitment of input + trace + output', 'Planned chain transaction broadcast', 'Planned independent replay'].map((item, index) => <div key={item} className="grid grid-cols-[48px_1fr] items-center border-b border-[#d7ff32]/15 p-5 last:border-0"><span className="font-mono text-[11px] text-[#d7ff32]">0{index + 1}</span><div className="flex items-center gap-4 text-base text-[#dfe5cf]">{index < 4 ? <CircleCheck size={18} className="text-[#d7ff32]" /> : <LockKeyhole size={18} className="text-[#d7ff32]" />}{item}</div></div>)}
          </div>
        </div>
      </section>

      <section id="economics" className="scroll-mt-24 border-y border-[#d7ff32]/20 bg-[#11130f]" aria-labelledby="economics-heading">
        <div className="section-shell py-24 lg:py-32">
          <SectionLabel number="07" children="Network economics" />
          <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]"><div><h2 id="economics-heading" className="text-5xl font-medium leading-tight tracking-[-.04em] sm:text-6xl">Live launch fees.<br /><span className="text-[#d7ff32]">Planned network settlement.</span></h2><p className="mt-8 text-lg leading-relaxed text-[#8e9787] max-w-lg">Genesis fee accounting is active on mainnet. Provider bonds, a verifier market, and dispute penalties remain planned and are not implied by the launchpad.</p></div><div className="grid gap-6 sm:grid-cols-2">{[['01', 'Live 1% pool fee', 'Every Genesis pool uses an immutable static 1% Uniswap v4 LP fee.', <Activity key="1" size={24} />], ['02', 'Live 70 / 30 FeeVault', 'Pull claims allocate 70% to the creator and 30% to protocol.', <LockKeyhole key="2" size={24} />], ['03', 'Planned provider bond', 'A future provider market could require a quality bond.', <Cpu key="3" size={24} />], ['04', 'Planned dispute penalties', 'Future settlement could price failed independent verification.', <ShieldCheck key="4" size={24} />]].map(([number, title, text, icon]) => <div key={number as string} className="border border-[#d7ff32]/20 p-8"><div className="mb-8 flex justify-between text-[#d7ff32]"><span>{icon as React.ReactNode}</span><span className="font-mono text-sm">{number as string}</span></div><h3 className="text-xl text-[#efffca]">{title as string}</h3><p className="mt-4 text-base leading-relaxed text-[#7e8878]">{text as string}</p></div>)}</div></div>
        </div>
      </section>

      <section id="comparison" className="section-shell scroll-mt-24 py-24 lg:py-32" aria-labelledby="comparison-heading">
        <SectionLabel number="08" children="A narrower bet" />
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><h2 id="comparison-heading" className="text-[2.5rem] font-medium leading-[1.02] tracking-[-.04em] sm:text-6xl">Not more GPUs.<br /><span className="text-[#d7ff32]">More accountability.</span></h2></div><p className="max-w-lg text-base leading-relaxed text-[#8e9787] sm:text-lg">Isogate is not trying to out-scale Render or io.net. The bet is narrower: prove the decision logic around an agent, not just its model output.</p></div>
        <div className="space-y-4 md:hidden">
          {comparisonRows.map((row) => (
            <article key={row[0]} className="overflow-hidden border border-[#d7ff32]/25 bg-[#0d0e0c]">
              <h3 className="border-b border-[#d7ff32]/20 bg-[#181c14] px-4 py-3 font-mono text-[11px] uppercase tracking-[.14em] text-[#9aa291]">{row[0]}</h3>
              <dl>
                {['Isogate', 'Render', 'Akash', 'io.net', 'OpenGradient'].map((platform, index) => (
                  <div key={platform} className={`grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-[#d7ff32]/10 px-4 py-4 last:border-0 ${index === 0 ? 'bg-[#d7ff32]/5' : ''}`}>
                    <dt className={`font-mono text-[10px] uppercase tracking-wider ${index === 0 ? 'text-[#d7ff32]' : 'text-[#687360]'}`}>{platform}</dt>
                    <dd className={`min-w-0 break-words text-sm leading-relaxed ${index === 0 ? 'text-[#edffac]' : 'text-[#8e9787]'}`}>{row[index + 1]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto border border-[#d7ff32]/25 md:block"><table className="w-full min-w-[1000px] border-collapse text-left"><thead><tr className="bg-[#181c14] font-mono text-xs uppercase tracking-wider text-[#687360]"><th className="w-[220px] p-6">Dimension</th><th className="bg-[#d7ff32]/10 p-6 text-[#d7ff32]">Isogate</th><th className="p-6">Render</th><th className="p-6">Akash</th><th className="p-6">io.net</th><th className="p-6">OpenGradient</th></tr></thead><tbody>{comparisonRows.map((row) => <tr key={row[0]} className="border-t border-[#d7ff32]/15 text-lg"><th className="p-6 font-mono text-xs uppercase tracking-wider text-[#687360]">{row[0]}</th>{row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`} className={`p-6 leading-relaxed ${index === 0 ? 'bg-[#d7ff32]/5 text-[#edffac]' : 'text-[#8e9787]'}`}>{value}</td>)}</tr>)}</tbody></table></div>
      </section>

      <section id="roadmap" className="scroll-mt-24 border-y border-[#d7ff32]/20 bg-[#11130f]" aria-labelledby="roadmap-heading">
        <div className="section-shell py-24 lg:py-32">
          <SectionLabel number="09" children="Build path" />
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <h2 id="roadmap-heading" className="text-5xl font-medium tracking-[-.04em] sm:text-6xl">From deterministic engine<br /><span className="text-[#d7ff32]">to live mainnet launch.</span></h2>
            <p className="max-w-3xl text-lg leading-relaxed text-[#8e9787] lg:justify-self-end sm:text-xl">The deterministic engine, wallet-bound Native Node, and Genesis launch contracts are live. A permissionless provider and verifier market remains future work.</p>
          </div>

          <div className="mt-14 border border-[#d7ff32]/25 bg-[#090b08]">
            <div className="flex items-center justify-between border-b border-[#d7ff32]/20 bg-[#0d100b] px-6 py-4">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.16em] text-[#88917d]">
                <span className="h-2 w-2 bg-[#d7ff32] shadow-[0_0_8px_rgba(215,255,50,.65)]" />
                Controlled launch sequence
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#687360]">03 live / 04 phases</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {[
                ['01', 'Live', 'Engine', 'Deterministic browser CPU and canonical replay runtime', 'Live', <Cpu key="1" size={24} />, 'Inspectable execution'],
                ['02', 'Live', 'Native Node', 'Wallet-bound provider jobs with server recomputation', 'Live', <Network key="2" size={24} />, 'Real device execution'],
                ['03', 'Live', 'Genesis', 'Robinhood Chain Registry, Factory, Coordinator, and launch index', 'Mainnet', <Layers3 key="3" size={24} />, 'Creator-signed launch'],
                ['04', 'Next', 'Open network', 'Permissionless provider economics and independent verifier market', 'Planned', <ShieldCheck key="4" size={24} />, 'Distributed settlement'],
              ].map(([number, phase, title, detail, status, icon, outcome], index) => (
                <div key={number as string} className="contents">
                  <article className={`relative flex min-h-[300px] flex-col p-6 transition-colors ${index < 3 ? 'bg-[#12170e]' : 'bg-[#0d0e0c] hover:bg-[#12160f]'}`}>
                    {index < 3 && <div className="absolute inset-x-0 top-0 h-px bg-[#d7ff32] shadow-[0_0_14px_rgba(215,255,50,.55)]" />}
                    <div className="flex items-start justify-between">
                      <span className={`flex h-14 w-14 items-center justify-center border ${index < 3 ? 'border-[#d7ff32] bg-[#d7ff32]/10 text-[#d7ff32] shadow-[0_0_24px_rgba(215,255,50,.10)]' : 'border-[#35412c] bg-[#11130f] text-[#687360]'}`}>{icon as React.ReactNode}</span>
                      <span className="font-mono text-xs text-[#687360]">{number as string} / 04</span>
                    </div>
                    <div className="mt-8 flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-[.16em] text-[#d7ff32]">{phase as string}</span>
                      <span className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${index < 3 ? 'border-[#d7ff32]/50 bg-[#d7ff32]/10 text-[#d7ff32]' : 'border-[#35412c] text-[#687360]'}`}>{status as string}</span>
                    </div>
                    <h3 className="mt-5 text-xl text-[#efffca]">{title as string}</h3>
                    <p className="mt-3 text-base leading-relaxed text-[#7e8878]">{detail as string}</p>
                    <div className="mt-auto border-t border-[#d7ff32]/15 pt-5 font-mono text-[10px] uppercase tracking-wider text-[#687360]">{outcome as string}</div>
                  </article>
                  {index < 3 && (
                    <div className="flex h-10 items-center justify-center border-y border-[#d7ff32]/10 text-[#35412c] lg:h-auto lg:w-9 lg:border-x lg:border-y-0" aria-hidden="true">
                      <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
