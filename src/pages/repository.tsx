import { Braces, ExternalLink, FileCode2, Github, Package } from 'lucide-react';

export function RepositoryPage() {
  return (
    <main className="section-shell py-20 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[.18em] text-[#d7ff32]">Project source</p>
        <h1 className="mt-6 text-5xl font-medium tracking-tight text-[#f1f3e8] sm:text-6xl">Repository</h1>
        <p className="mt-8 text-xl leading-relaxed text-[#8e9787]">
          Follow Isogate development, source releases, and project updates through the official links below.
        </p>

        <div className="mt-14 border border-[#d7ff32]/25 bg-[#0a0c09]">
          <div className="flex items-center gap-3 border-b border-[#d7ff32]/20 bg-[#11150e] px-8 py-5">
            <Github size={20} className="text-[#d7ff32]" />
            <span className="font-mono text-xs uppercase tracking-[.14em] text-[#efffca]">Official channels</span>
          </div>
          <div className="grid gap-px bg-[#d7ff32]/15 sm:grid-cols-2">
            <div className="bg-[#0d0e0c] p-8">
              <FileCode2 size={24} className="text-[#d7ff32]" />
              <h2 className="mt-6 text-lg font-medium text-[#efffca]">Current interface</h2>
              <p className="mt-3 text-base leading-relaxed text-[#7e8878]">
                The available website demonstrates the CPU Console, Native Node provider network, documentation, and product model.
              </p>
            </div>
            <div className="bg-[#0d0e0c] p-8">
              <Braces size={24} className="text-[#d7ff32]" />
              <h2 className="mt-6 text-lg font-medium text-[#efffca]">Public development</h2>
              <p className="mt-3 text-base leading-relaxed text-[#7e8878]">
                Browse the Isogate organization on GitHub. Individual repository availability, licenses, and release status remain defined by each repository.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <a href="https://github.com/Isogate-CPU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#d7ff32] px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#d7ff32] hover:bg-[#d7ff32] hover:text-[#0d0e0c]">
            <Github size={15} /> Open GitHub <ExternalLink size={13} />
          </a>
          <a href="https://x.com/Isogate_CPU" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#d7ff32]/30 px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#88917d] hover:border-[#d7ff32] hover:text-[#d7ff32]">
            <span aria-hidden="true">𝕏</span> Follow on X <ExternalLink size={13} />
          </a>
          <a href="https://www.npmjs.com/package/@isogate/node" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#d7ff32]/30 px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#88917d] hover:border-[#d7ff32] hover:text-[#d7ff32]">
            <Package size={15} /> View on npm <ExternalLink size={13} />
          </a>
          <a href="?page=docs" className="border border-[#d7ff32] px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#d7ff32] hover:bg-[#d7ff32] hover:text-[#0d0e0c]">
            Read documentation
          </a>
          <a href="?page=status" className="border border-[#d7ff32]/30 px-6 py-4 font-mono text-xs uppercase tracking-wider text-[#88917d] hover:border-[#d7ff32] hover:text-[#d7ff32]">
            View product status
          </a>
        </div>
      </div>
    </main>
  );
}