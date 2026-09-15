import { ChevronRight } from 'lucide-react';
import { opcodes, checkpoints } from '../lib/constants';

export function DocsPage() {
  const sections = [
    { id: 'intro', title: 'What is Isogate?' },
    { id: 'flow', title: 'Provider Job Flow' },
    { id: 'console', title: 'CPU Console Guide' },
    { id: 'native-node', title: 'Native Node Guide' },
    { id: 'genesis', title: 'Genesis Launchpad' },
    { id: 'genesis-economics', title: 'Supply, Liquidity & Fees' },
    { id: 'genesis-finality', title: 'Finality & Recovery' },
    { id: 'isa', title: 'Instruction Set (ISA)' },
    { id: 'verification', title: 'Verification Methods' },
    { id: 'mainnet', title: 'Mainnet Addresses' },
    { id: 'limits', title: 'Architecture & Limitations' },
    { id: 'guide', title: 'Getting Started' },
  ];

  return (
    <div className="section-shell flex flex-col md:flex-row gap-12 py-16 lg:py-24 max-w-[1200px] mx-auto">
      <aside className="shrink-0 overflow-hidden md:w-64">
        <div className="sticky top-28">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[#687360] mb-5">Documentation</h2>
          <nav className="flex gap-2 overflow-x-auto pb-3 md:flex-col md:gap-1 md:overflow-visible md:pb-0" aria-label="Documentation sections">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="group flex shrink-0 items-center gap-3 whitespace-nowrap border border-[#2a3621] px-3 py-2 text-sm text-[#88917d] transition-colors hover:border-[#d7ff32]/50 hover:text-[#d7ff32] md:border-0 md:px-0 md:text-base">
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-5 absolute text-[#d7ff32]" />
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>
      
      <div className="flex-1 max-w-4xl prose prose-lg prose-invert prose-p:text-[#8e9787] prose-p:leading-relaxed prose-headings:text-[#f1f3e8] prose-a:text-[#d7ff32] prose-strong:text-[#efffca] prose-code:text-[#edffac] prose-code:bg-[#11150e] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm">
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-10 text-[#f1f3e8]">Isogate Documentation</h1>
        
        <section id="intro" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">What is Isogate?</h2>
          <p>Isogate combines a deterministic virtual CPU, a working Native Node compute-provider flow, and the live Genesis launchpad on Robinhood Chain. A wallet-bound Native Node executes a bounded built-in workload, while the server independently recomputes the canonical output before it can become a token identity.</p>
        </section>

        <section id="flow" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Provider Job Flow</h2>
          <p>The current provider system follows this lifecycle:</p>
          <ol className="list-decimal list-inside space-y-4 text-[#8e9787]">
            <li><strong className="text-[#efffca]">Detect:</strong> Native Node reads OS-reported CPU, architecture, memory, and runtime data and runs a fixed SHA-256 benchmark.</li>
            <li><strong className="text-[#efffca]">Register:</strong> CPU Console and the API independently verify the report digest before storing the provider.</li>
            <li><strong className="text-[#efffca]">Queue:</strong> CPU Console creates a bounded eight-byte, 1–32 cycle deterministic job.</li>
            <li><strong className="text-[#efffca]">Execute:</strong> Native Node sends heartbeats, claims the queued job, and executes it on the provider device.</li>
            <li><strong className="text-[#efffca]">Verify:</strong> The server recomputes the expected canonical result and accepts only a matching digest, engine, inputs, and cycle count.</li>
            <li><strong className="text-[#efffca]">Compare:</strong> CPU Console compares the completed native result with an independent browser Web Worker replay.</li>
          </ol>
        </section>

        <section id="console" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">CPU Console Guide</h2>
          <p>The landing page remains a browser simulation. The separate <a href="?page=console" className="no-underline hover:underline">CPU Console</a> is the application dashboard for provider registration and real native jobs.</p>
          <ul className="list-disc list-inside space-y-4 text-[#8e9787] mb-8">
            <li><strong className="text-[#efffca]">Import Report:</strong> Select the JSON produced by <code>isogate-node diagnose</code>.</li>
            <li><strong className="text-[#efffca]">Provider Status:</strong> Copy the registered provider UUID and keep the Native Node process running.</li>
            <li><strong className="text-[#efffca]">Wallet Binding:</strong> Connect a wallet on Robinhood Chain and sign the ownership challenge. Binding is a gasless signature, not an on-chain transaction.</li>
            <li><strong className="text-[#efffca]">Run Provider Job:</strong> Queue a workload and wait for the Native Node to claim and complete it.</li>
            <li><strong className="text-[#efffca]">Digest Agreement:</strong> Confirm that the Native Node result matches the browser replay.</li>
          </ul>
          <p>Closing the Native Node process makes the provider offline after the heartbeat window. A queued Console job cannot complete while the provider process is stopped.</p>
        </section>

        <section id="native-node" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Native Node Installation & Operation</h2>
          <h3>Requirements</h3>
          <ul className="list-disc list-inside space-y-3 text-[#8e9787]">
            <li>Node.js 20 or newer on Windows, macOS, or Linux.</li>
            <li>Network access to the Isogate HTTPS API.</li>
            <li>A supported Node.js CPU architecture.</li>
          </ul>
          <h3>1. Install</h3>
          <pre><code>npm install -g @isogate/node</code></pre>
          <p>If npm registry propagation is not complete, download the release tarball and run <code>npm install -g ./isogate-node-0.3.1.tgz</code>.</p>
          <h3>2. Generate a device report</h3>
          <pre><code>isogate-node diagnose --output isogate-diagnostic.json</code></pre>
          <p>Do not manually edit the JSON. Any change invalidates its SHA-256 report digest.</p>
          <h3>3. Register the device</h3>
          <p>Open CPU Console, connect your wallet on Robinhood Chain, and choose <strong>Import Report</strong>. Sign the wallet binding message to authenticate as the owner, then copy both the provider UUID and one-time provider credential shown after backend registration. The backend stores only its hash.</p>
          <h3>4. Start the provider</h3>
          <pre><code>{`isogate-node start \\
  --server https://YOUR-ISOGATE-HOST/api \\
  --provider YOUR-PROVIDER-ID`}</code></pre>
          <p>The CLI will prompt for your one-time credential (hidden input). For automated environments, set the <code>ISOGATE_PROVIDER_CREDENTIAL</code> environment variable. Keep this terminal open. The default poll interval is three seconds; an optional <code>--poll-seconds</code> value from 2 to 60 may be supplied. The process maintains an online heartbeat automatically.</p>
          <h3>5. Verify a job</h3>
          <p>Connect wallet access in CPU Console, choose inputs and cycles, then select <strong>Run Provider Job</strong>. A successful run displays <code>completed</code>, a recorded job ID, and <code>DIGEST MATCH</code>.</p>
          <h3>Stop safely</h3>
          <p>Press <code>Ctrl+C</code>. The process finishes its current request, stops polling, and the provider becomes offline when heartbeats expire.</p>
        </section>

        <section id="genesis" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Genesis Launchpad</h2>
          <p><a href="?page=genesis" className="no-underline hover:underline">Isogate Genesis</a> converts one verified Native Node CPU result into an immutable token identity. The creator never types or selects the logo, name, symbol, description, seed, or engine versions.</p>
          <ol className="list-decimal list-inside space-y-4 text-[#8e9787]">
            <li><strong className="text-[#efffca]">Wallet and Native Node:</strong> The intended creator wallet must own an online provider.</li>
            <li><strong className="text-[#efffca]">Canonical CPU candidate:</strong> The Native Node produces the deterministic identity bundle and exactly 256 RGB565 pixels.</li>
            <li><strong className="text-[#efffca]">Independent verification:</strong> The server reruns the built-in workload and accepts only an exact result, engine, trace, CPU digest, and image digest match.</li>
            <li><strong className="text-[#efffca]">Creator approval:</strong> The creator signs the exact verified identity and canonical PNG digest. This signature does not deploy a token.</li>
            <li><strong className="text-[#efffca]">Canonical artifact:</strong> The server converts the RGB565 pixels into the canonical PNG and pins that image to IPFS using server-only Pinata credentials.</li>
            <li><strong className="text-[#efffca]">Deployment proof:</strong> The dedicated verifier signs a short-lived proof binding the creator, identity fields, CPU digest, image digest, and immutable <code>ipfs://</code> logo URI.</li>
            <li><strong className="text-[#efffca]">Creator transactions:</strong> The connected wallet submits Registry approval, Factory token deployment, and Factory liquidity launch as separate on-chain transactions.</li>
            <li><strong className="text-[#efffca]">Public reconciliation:</strong> After finality, the backend validates canonical receipts and contract state before the launch appears in <a href="?page=genesis-launches" className="no-underline hover:underline">CPU Launches</a>.</li>
          </ol>
          <div className="bg-[#d7ff32]/10 border border-[#d7ff32]/30 p-6 rounded-md mt-8 not-prose">
            <p className="text-sm text-[#e9ebdf] leading-relaxed"><strong className="text-[#d7ff32]">Custody boundary:</strong> the server never receives or signs with the creator private key. A verified identity, uploaded PNG, or issued proof is not a token. The token exists only after the creator confirms the deployment transaction.</p>
          </div>
        </section>

        <section id="genesis-economics" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Supply, Liquidity & Fees</h2>
          <ul className="list-disc list-inside space-y-4 text-[#8e9787]">
            <li><strong className="text-[#efffca]">Fixed supply:</strong> Genesis v2 mints 1,000,000,000 tokens once, burns 1,000,000 with the canonical ERC-20 zero-address burn, and leaves a final total supply of 999,000,000. There is no mint function, proxy, blacklist, mutable tax, or hidden administrator.</li>
            <li><strong className="text-[#efffca]">Permanent burn:</strong> the 1,000,000-token genesis burn is not sent to the dead address. Any token dust remaining after liquidity placement is sent to the dead address and is tracked separately.</li>
            <li><strong className="text-[#efffca]">Creator allocation:</strong> none. The remaining supply is reserved for the direct liquidity launch.</li>
            <li><strong className="text-[#efffca]">Pool:</strong> a direct Uniswap v4 native/token pool with a static 1% LP fee, tick spacing 200, and fixed <code>sqrtPriceX96 = 34,500 × Q96</code> (1,190,250,000 token units per native). The roughly $4.2k figure assumes native near $5,005 and is only an approximation; fixed pricing cannot guarantee a USD valuation.</li>
            <li><strong className="text-[#efffca]">Position:</strong> one asymmetric liquidity position is created and permanently locked. Excess native value is refunded by the Coordinator.</li>
            <li><strong className="text-[#efffca]">Fee split:</strong> the immutable FeeVault accounts for 70% creator and 30% protocol fees through pull payments.</li>
            <li><strong className="text-[#efffca]">Claims:</strong> creators claim directly from their own wallet in the <a href="?page=creator-dashboard" className="no-underline hover:underline">Creator Dashboard</a>. The frontend rechecks Factory and FeeVault bindings and simulates the claim before requesting a transaction.</li>
          </ul>
        </section>

        <section id="genesis-finality" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Finality, Indexing & Recovery</h2>
          <p>The public launch index is deliberately fail-closed. A launch is listed only after the launch receipt has 12 subsequent blocks and every canonical check succeeds.</p>
          <ul className="list-disc list-inside space-y-4 text-[#8e9787]">
            <li>Receipt block hashes must remain canonical and the expected Factory and Coordinator events must be present.</li>
            <li>Registry approval, creator, token metadata, supply, burn balance, FeeVault binding, hook, pool, liquidity amount, position lock, and dust burn must agree with contract state.</li>
            <li>A validation mismatch is rejected; an RPC or infrastructure failure never becomes an accepted launch.</li>
            <li>The browser can resume partial progress from canonical Registry, Factory, Coordinator, and event state. Local session data is only a recovery hint.</li>
            <li>An expired verifier proof blocks a new Registry approval, but it does not block resuming deployment after the same identity is already approved on-chain.</li>
          </ul>
        </section>

        <section id="isa" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Instruction Set (ISA)</h2>
          <p>Isogate uses a 16-bit educational/demo ISA with 8 registers (R0-R7) and a 256-byte address space.</p>
          <div className="bg-[#090b08] border border-[#d7ff32]/20 rounded-md overflow-hidden my-10 not-prose">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-base">
              <thead className="bg-[#11150e] text-[#687360] font-mono text-[11px] uppercase tracking-wider">
                <tr><th className="p-5 font-normal">Opcode</th><th className="p-5 font-normal">Mnemonic</th><th className="p-5 font-normal">Operation</th></tr>
              </thead>
              <tbody className="divide-y divide-[#d7ff32]/10">
                {opcodes.map(([code, mnemonic, operation]) => (
                  <tr key={code} className="hover:bg-[#12160f] transition-colors">
                    <td className="p-5 font-mono text-[#d7ff32] text-sm">{code}</td>
                    <td className="p-5 font-bold text-[#efffca]">{mnemonic}</td>
                    <td className="p-5 text-[#8e9787]">{operation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>

        <section id="verification" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Verification Methods</h2>
          <p>Every gate trace undergoes five independent simulated checks before a certificate is finalized:</p>
          <div className="space-y-6 my-10 not-prose">
            {checkpoints.map(cp => (
              <div key={cp.number} className="bg-[#11130f] p-6 border-l-[3px] border-[#d7ff32]">
                <strong className="text-[#efffca] block mb-3 font-mono text-base tracking-wide">{cp.number}. {cp.title}</strong>
                <span className="text-base text-[#8e9787] leading-relaxed">{cp.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="mainnet" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Genesis v2 Mainnet Addresses & Dependencies</h2>
          <p>The active Isogate Genesis v2 launchpad is live on Robinhood Chain (Chain ID 4663). No server-side custody or token existence occurs before on-chain transactions. Earlier v1 contracts remain historical records and are not the active launch route.</p>
          <div className="bg-[#090b08] border border-[#d7ff32]/20 rounded-md overflow-x-auto my-10 not-prose">
            <table className="w-full min-w-[760px] text-left text-base">
              <thead className="bg-[#11150e] text-[#687360] font-mono text-[11px] uppercase tracking-wider">
                <tr><th className="p-5 font-normal">Component</th><th className="p-5 font-normal">Address / Version</th></tr>
              </thead>
              <tbody className="divide-y divide-[#d7ff32]/10">
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Identity Registry v2</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0xB946ad99b17d741ABFCBCAec85F5a896a02C62fC</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Genesis Factory v2</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0x100D6f949c1C6751799EB510765Bcd7a3e65834A</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Launch Coordinator v2</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0xf3c2CAe988356112a9584389DDb6bc7bf3258c52</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Uniswap v4 PoolManager</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0x8366a39CC670B4001A1121B8F6A443A643e40951</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Uniswap v4 PositionManager</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0x58daec3116aae6D93017bAAea7749052E8a04fA7</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">Permit2</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0x000000000022D473030F116dDEE9F6B43aC78BA3</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">WETH</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm break-all">0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73</td>
                </tr>
                <tr className="hover:bg-[#12160f] transition-colors">
                  <td className="p-5 font-bold text-[#efffca]">@isogate/node</td>
                  <td className="p-5 font-mono text-[#d7ff32] text-sm">v0.3.1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Explorer: <a href="https://robinhoodchain.blockscout.com" target="_blank" rel="noopener noreferrer">robinhoodchain.blockscout.com</a>. RPC: <code>https://rpc.mainnet.chain.robinhood.com/</code>.</p>
        </section>

        <section id="limits" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Architecture & Limitations</h2>
          <div className="bg-[#d7ff32]/10 border border-[#d7ff32]/30 p-8 rounded-md mb-10 not-prose">
            <h3 className="text-[#d7ff32] font-mono font-bold tracking-widest uppercase text-sm mb-4">Important Notice</h3>
            <p className="text-base text-[#e9ebdf] leading-relaxed">Native Node execution and PostgreSQL job persistence are active in this experimental technical beta. Workloads are built-in, bounded, and independently recomputed by the server.</p>
          </div>
          <p>The current Node executes only Isogate&apos;s bounded deterministic workloads; it cannot run arbitrary customer workloads. Replay and RGB565 digests identify the server-recomputed result.</p>
        </section>

        <section id="guide" className="scroll-mt-24 mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium border-b border-[#d7ff32]/20 pb-4 mb-6 text-[#efffca]">Getting Started</h2>
          <p>For the fastest browser-only demonstration:</p>
          <ol className="list-decimal list-inside space-y-4 text-[#8e9787]">
            <li>Navigate to the processor simulation on the homepage.</li>
            <li>Press <strong className="text-[#efffca]">Execute</strong> to begin the deterministic cycle simulation.</li>
            <li>Watch the <strong className="text-[#efffca]">Instruction Buffer</strong> feed operations into the NAND core.</li>
            <li>Observe the <strong className="text-[#efffca]">Trace & Proof</strong> panel as checks complete and output a simulated local verification result.</li>
            <li>Adjust the <strong className="text-[#efffca]">Clock Speed</strong> to slow down and inspect individual gates.</li>
          </ol>
          <p className="mt-8">For the live Genesis path, connect the intended creator wallet, register and bind a Native Node in CPU Console, keep it online, then open <a href="?page=genesis" className="no-underline hover:underline">Genesis</a>. Read every displayed value before confirming the three irreversible creator transactions.</p>
        </section>
      </div>
    </div>
  );
}
