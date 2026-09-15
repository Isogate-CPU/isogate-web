import { ArrowRight, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';

const legalPages = [
  {
    title: 'Security & Trust',
    description: 'Review the current browser trust boundary, security assumptions, and planned network controls.',
    href: '?page=security',
    icon: <ShieldCheck size={26} />,
  },
  {
    title: 'Privacy Policy',
    description: 'Understand what the current demonstration does and does not collect or persist.',
    href: '?page=privacy',
    icon: <LockKeyhole size={26} />,
  },
  {
    title: 'Terms of Use',
    description: 'Read the conditions, limitations, and experimental-use disclaimer for this interface.',
    href: '?page=terms',
    icon: <FileText size={26} />,
  },
];

export function LegalPage() {
  return (
    <main className="section-shell py-20 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[.18em] text-[#d7ff32]">Trust center</p>
        <h1 className="mt-6 text-5xl font-medium tracking-tight text-[#f1f3e8] sm:text-6xl">Trust &amp; Legal</h1>
        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#8e9787]">
          Clear boundaries for the live Isogate technical beta. These pages distinguish the browser simulation,
          Native Node verification, Genesis v2 contracts, and planned network expansion.
        </p>

        <div className="mt-16 grid gap-px border border-[#d7ff32]/20 bg-[#d7ff32]/20 md:grid-cols-3">
          {legalPages.map((page) => (
            <a
              key={page.title}
              href={page.href}
              className="group flex min-h-[300px] flex-col bg-[#0d0e0c] p-8 transition-colors hover:bg-[#13180f] focus-visible:bg-[#13180f]"
            >
              <span className="flex h-14 w-14 items-center justify-center border border-[#d7ff32]/30 text-[#d7ff32]">
                {page.icon}
              </span>
              <h2 className="mt-10 text-xl font-medium text-[#efffca]">{page.title}</h2>
              <p className="mt-4 flex-1 text-base leading-relaxed text-[#7e8878]">{page.description}</p>
              <span className="mt-8 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-[#d7ff32]">
                Open page <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>

        <aside className="mt-12 border-l-[3px] border-[#d7ff32] bg-[#11130f] p-8 text-base leading-relaxed text-[#8e9787]">
          Isogate operates bounded Native Node workloads with canonical server recomputation and a separate
          creator-signed Genesis v2 launch flow on Robinhood Chain. Isogate does not provide server-side wallet
          custody, arbitrary remote-code execution, or a permissionless independent verifier network. Browser
          certificates remain simulated local results; Genesis contract state and transactions are public on-chain records.
          Product status is the source of truth for current availability.
          <a href="?page=status" className="ml-2 text-[#d7ff32] hover:underline">View product status.</a>
        </aside>
      </div>
    </main>
  );
}