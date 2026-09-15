import { useEffect, useState } from 'react';
import { Layout } from './components/layout';
import { LandingPage } from './pages/landing';
import { DocsPage } from './pages/docs';
import { PrivacyPage } from './pages/privacy';
import { TermsPage } from './pages/terms';
import { SecurityPage } from './pages/security';
import { StatusPage } from './pages/status';
import { LegalPage } from './pages/legal';
import { RepositoryPage } from './pages/repository';
import { ConsolePage } from './pages/console';
import { ProviderPage } from './pages/provider';
import { AgentControlPage } from './pages/agent-control';
import { TokenSettlementPage } from './pages/token-settlement';
import { NetworkExplorerPage } from './pages/network-explorer';
import { ProofReceiptPage } from './pages/proof-receipt';
import { MachineVisualizerPage } from './pages/machine-visualizer';
import { IntegrationHubPage } from './pages/integration-hub';
import { EarnPage } from './pages/earn';
import { GenesisPage } from './pages/genesis';
import { GenesisLaunchesPage } from './pages/genesis-launches';
import { CreatorDashboardPage } from './pages/creator-dashboard';

const PAGE_META: Record<string, { title: string; description: string }> = {
  home: { title: 'Isogate — Inspectable Deterministic Computing', description: 'Explore Isogate’s virtual CPU, verified Native Node workloads, and CPU-generated Genesis assets on Robinhood Chain.' },
  docs: { title: 'Isogate Documentation — CPU, Native Node & Genesis', description: 'Technical documentation for the Isogate virtual CPU, Native Node verification, Genesis v2, contracts, and Robinhood Chain.' },
  genesis: { title: 'Isogate Genesis — CPU-Generated On-Chain Assets', description: 'Generate deterministic digital identities through Native Node execution and launch constrained assets on Robinhood Chain.' },
  'genesis-launches': { title: 'Isogate Genesis Launches — Public On-Chain Records', description: 'Explore public Isogate Genesis identities, contracts, liquidity bindings, transactions, and source-verification records.' },
  provider: { title: 'Isogate Native Node Provider Network', description: 'Register supported CPU hardware, run bounded deterministic Native Node jobs, and submit results for canonical verification.' },
  'network-explorer': { title: 'Isogate Network Explorer — Providers & Verification', description: 'Inspect Isogate providers, deterministic jobs, network activity, and public verification records.' },
  status: { title: 'Isogate Product Status — Live Beta and Roadmap', description: 'See which Isogate CPU, Native Node, Genesis v2, verification, and planned network capabilities are currently available.' },
  security: { title: 'Isogate Security and Trust Boundaries', description: 'Review Isogate’s deterministic execution model, wallet boundaries, Native Node safety, Genesis contracts, and current limitations.' },
  repository: { title: 'Isogate GitHub, npm and Developer Resources', description: 'Find the official Isogate GitHub organization, Native Node npm package, documentation, status, and source resources.' },
};

function useCurrentPage() {
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('page') || 'home';
    }
    return 'home';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPage(new URLSearchParams(window.location.search).get('page') || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return page;
}

interface AppProps {
  walletEnabled?: boolean;
}

function App({ walletEnabled = true }: AppProps) {
  const page = useCurrentPage();

  useEffect(() => {
    const meta = PAGE_META[page] ?? PAGE_META.home;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalUrl = page === 'home' ? 'https://isogate.tech/' : `https://isogate.tech/?page=${encodeURIComponent(page)}`;
    canonical?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', meta.description);
  }, [page]);

  if (page === 'console') {
    return (
      <Layout walletEnabled={walletEnabled} hideFooter>
        <ConsolePage walletEnabled={walletEnabled} />
      </Layout>
    );
  }

  let content;
  switch (page) {
    case 'docs':
      content = <DocsPage />;
      break;
    case 'privacy':
      content = <PrivacyPage />;
      break;
    case 'terms':
      content = <TermsPage />;
      break;
    case 'security':
      content = <SecurityPage />;
      break;
    case 'status':
      content = <StatusPage />;
      break;
    case 'legal':
      content = <LegalPage />;
      break;
    case 'repository':
      content = <RepositoryPage />;
      break;
    case 'provider':
      content = <ProviderPage />;
      break;
    case 'agent-control':
      content = <AgentControlPage />;
      break;
    case 'token-settlement':
      content = <TokenSettlementPage />;
      break;
    case 'network-explorer':
      content = <NetworkExplorerPage />;
      break;
    case 'proof-receipt':
      content = <ProofReceiptPage />;
      break;
    case 'machine-visualizer':
      content = <MachineVisualizerPage />;
      break;
    case 'integration-hub':
      content = <IntegrationHubPage />;
      break;
    case 'earn':
      content = <EarnPage />;
      break;
    case 'genesis':
      content = <GenesisPage />;
      break;
    case 'genesis-launches':
      content = <GenesisLaunchesPage />;
      break;
    case 'creator-dashboard':
      content = <CreatorDashboardPage />;
      break;
    case 'home':
    default:
      content = <LandingPage />;
      break;
  }

  return (
    <Layout walletEnabled={walletEnabled}>
      {content}
    </Layout>
  );
}

export default App;
