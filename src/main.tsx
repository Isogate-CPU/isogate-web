import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import App from './App';
import { setBaseUrl } from '@api-client';
import { ErrorBoundary } from '@/components/error-boundary';
import { wagmiAdapter, walletConfigured } from './lib/wallet';

import './index.css';

// Use same-origin API calls by default; deployments can point the client at a
// separate public API with VITE_API_BASE_URL.
setBaseUrl(import.meta.env.VITE_API_BASE_URL || null);

const queryClient = new QueryClient();
const app = (
  <QueryClientProvider client={queryClient}>
    {walletConfigured && wagmiAdapter ? (
      <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount>
      <App walletEnabled />
      </WagmiProvider>
    ) : (
      <App walletEnabled={false} />
    )}
  </QueryClientProvider>
);

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    {app}
  </ErrorBoundary>,
);
