export function PrivacyPage() {
  return (
    <div className="section-shell py-20 lg:py-32 max-w-4xl mx-auto prose prose-lg prose-invert prose-p:text-[#8e9787] prose-p:leading-relaxed prose-headings:text-[#f1f3e8]">
      <h1 className="text-5xl font-medium tracking-tight mb-8">Privacy Policy</h1>
      <p className="text-sm font-mono text-[#687360] mb-16 uppercase tracking-wider">Last Updated: September 13, 2026</p>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">1. Overview</h2>
        <p>This Privacy Policy explains data processing for the Isogate experimental demonstration, CPU Console, and Native Node provider flow. We minimize collection and separate browser simulation data from persisted provider and job records.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">2. Data We Do Not Collect</h2>
        <p>Because the Isogate application operates locally within your browser, we do not intentionally collect, store, or process any personal data. Specifically:</p>
        <ul className="list-disc list-inside space-y-4 text-[#8e9787] mt-6">
          <li><strong className="text-[#efffca]">No User Accounts:</strong> There is no user account system or registration.</li>
          <li><strong className="text-[#efffca]">No Financial Activity:</strong> Wallet connection is used only for console access. The site does not request transactions or signatures, read balances, or track assets.</li>
          <li><strong className="text-[#efffca]">No Host Identity Upload:</strong> Native reports do not include hostname, local files, environment variables, credentials, or wallet addresses.</li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">3. Provider and Job Data</h2>
        <p>When a Native Node report is registered, Isogate stores a random provider ID, report digest, OS-reported CPU capabilities, architecture, memory and runtime report, registration time, and last heartbeat time. Provider jobs store bounded input bytes, cycle count, lifecycle timestamps, canonical replay result, and replay digest.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">4. Technical Data and Infrastructure</h2>
        <p>The hosting and platform infrastructure that serves this website may automatically collect standard technical logs, such as IP addresses, browser types, and access times, to ensure security and network performance. This is standard operational data processed by our hosting providers and is not used to track individual users across platforms.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">5. Third-Party Integrations</h2>
        <p>Wallet connection is provided by Reown AppKit and WalletConnect-compatible services. When you connect, those services and your wallet may process your public wallet address, chain ID, connection status, device, and network metadata under their own privacy terms. AppKit analytics, email login, and social login are disabled in this application.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-6 border-b border-[#d7ff32]/20 pb-4 text-[#efffca]">6. Updates and Contact</h2>
        <p>As the Isogate network transitions from a local demonstration to a live environment, this privacy policy will be updated to reflect the processing of blockchain data and verifier network telemetry. For inquiries, please refer to the project repository or official community channels.</p>
      </section>
    </div>
  );
}
