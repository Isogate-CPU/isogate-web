import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { SectionLabel, ArrowLink } from './ui-utils';

const faqItems = [
  {
    id: 'what-is-isogate',
    question: 'What exactly is Isogate?',
    answer: 'Isogate is a deterministic virtual CPU concept for engineers. It compiles decision logic into gate-level execution, allowing autonomous agent behavior to be replayed, inspected, and independently verified.'
  },
  {
    id: 'is-execution-live',
    question: 'Is the execution happening on a live backend?',
    answer: 'The landing simulator runs locally in browser memory. CPU Console can queue a bounded job for a registered Native Node, which executes it on the provider device and submits the result for independent server verification. There is no distributed verifier network or on-chain execution.'
  },
  {
    id: 'what-is-simulated-cert',
    question: 'What does the simulated certificate mean?',
    answer: 'The certificate is a visual representation of determinism checks. It has no cryptographic validity, legal standing, or on-chain proof. It demonstrates the conceptual model of what a finalized verification looks like.'
  },
  {
    id: 'do-i-need-account',
    question: 'Do I need a wallet or an account?',
    answer: 'The public simulator needs no account or wallet. CPU Console controls require a connected wallet on Robinhood Chain, but the app does not request a signature or transaction and the wallet connection is not backend authentication.'
  },
  {
    id: 'is-chain-integration-live',
    question: 'Is the blockchain integration active?',
    answer: 'No. References to chain integration, smart contracts, testnets, token staking, or slashing reflect a planned architectural target. There is no active bridge or contract deployment on any network.'
  },
  {
    id: 'what-data-stored',
    question: 'What data is stored during simulation?',
    answer: 'The public simulation stays in browser memory. CPU Console stores registered provider capabilities, bounded job inputs, lifecycle timestamps, replay traces, and digests in PostgreSQL. Native reports exclude hostname, wallet address, files, environment variables, and credentials.'
  },
  {
    id: 'what-are-five-perspectives',
    question: 'What do the five verification perspectives mean?',
    answer: 'They represent independent checks against a single deterministic execution trace: arithmetic coverage, cross-model agreement, production path, runtime stability, and on-chain parity. In the current simulator, these are conceptually modeled.'
  },
  {
    id: 'what-is-planned-next',
    question: 'What is planned next for Isogate?',
    answer: 'The roadmap moves from deterministic engine completion to testnet contract deployment, followed by an independent verifier market, and finally a production SDK. The system must earn the right to advance at each phase.'
  }
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id);

  const toggle = (id: string) => {
    setOpenId(current => (current === id ? null : id));
  };

  return (
    <section id="faq" className="section-shell scroll-mt-24 py-24 lg:py-32" aria-labelledby="faq-heading">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div>
          <SectionLabel number="09">Diagnostic FAQ</SectionLabel>
          <h2 id="faq-heading" className="mt-8 max-w-2xl text-5xl font-medium leading-tight tracking-[-.04em] sm:text-6xl text-[#f1f3e8]">
            System parameters and <span className="text-[#d7ff32]">boundaries.</span>
          </h2>
          <p className="mt-8 max-w-lg text-lg text-[#8e9787] leading-relaxed">
            Precise answers regarding the current state of the Isogate execution model, network integration, and simulator limitations.
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <ArrowLink href="?page=docs">Read Documentation</ArrowLink>
            <ArrowLink href="?page=status">View Status Matrix</ArrowLink>
            <ArrowLink href="?page=security">Security Model</ArrowLink>
          </div>
        </div>

        <div className="border border-[#2a3621] bg-[#090b08] shadow-2xl flex flex-col">
          <div className="h-12 border-b border-[#2a3621] px-6 flex items-center justify-between text-[11px] tracking-widest bg-[#060805] shrink-0 font-mono">
            <div className="flex items-center gap-3 text-[#d7ff32]">
              <HelpCircle size={14} />
              <span className="font-bold">KNOWLEDGE BASE</span>
            </div>
            <div className="hidden sm:block text-[#596252]">
              DIAGNOSTIC QUERY INTERFACE
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#2a3621]">
            {faqItems.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="group bg-[#0a0c0a] transition-colors hover:bg-[#11150e]">
                  <button
                    id={`faq-question-${item.id}`}
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    className="flex w-full items-center justify-between p-6 lg:px-10 lg:py-8 text-left outline-none focus-visible:bg-[#11150e] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#d7ff32]"
                  >
                    <div className="flex items-center gap-5 lg:gap-8">
                      <span className="font-mono text-xs text-[#596252] group-hover:text-[#d7ff32] transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className={`text-lg tracking-tight transition-colors ${isOpen ? 'text-[#d7ff32]' : 'text-[#e9ebdf] group-hover:text-[#f1f3e8]'}`}>
                        {item.question}
                      </span>
                    </div>
                    <div className={`ml-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#d7ff32]' : 'text-[#435234] group-hover:text-[#d7ff32]'}`}>
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </button>
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-8 pt-2 lg:px-10 lg:pb-10 lg:pl-[5.5rem]">
                        <div className="border-l border-[#d7ff32]/30 pl-5 py-2">
                          <p className="text-base leading-relaxed text-[#8e9787]">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
