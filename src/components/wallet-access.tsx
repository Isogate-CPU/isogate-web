import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { AlertTriangle, CheckCircle2, LogOut, Network, Wallet } from 'lucide-react';
import { useState } from 'react';
import { appKit, robinhoodChain } from '../lib/wallet';

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function useConsoleAccess() {
  const { address, isConnected, status } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const isCorrectNetwork = chainId === robinhoodChain.id;

  return {
    address,
    isConnected,
    isCorrectNetwork,
    isReady: isConnected && isCorrectNetwork,
    status,
  };
}

export function HeaderWalletControl({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#687360]">
        Wallet unavailable
      </span>
    );
  }
  return <ActiveHeaderWalletControl />;
}

function ActiveHeaderWalletControl() {
  const { open } = useAppKit();
  const { switchNetwork } = useAppKitNetwork();
  const access = useConsoleAccess();
  const [pending, setPending] = useState(false);

  const runAction = async (action: () => Promise<unknown>) => {
    setPending(true);
    try {
      await action();
    } finally {
      setPending(false);
    }
  };

  if (access.status === 'reconnecting') {
    return (
      <span
        className="inline-flex min-h-9 items-center gap-2 border border-[#35412c] px-3 font-mono text-[10px] uppercase tracking-wider text-[#88917d]"
        role="status"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f6c453]" />
        Reconnecting
      </span>
    );
  }

  if (!access.isConnected) {
    return (
      <button
        type="button"
        onClick={() => runAction(() => open())}
        disabled={pending}
        className="inline-flex min-h-9 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0d0e0c] transition-colors hover:bg-[#e4ff74] disabled:opacity-50"
      >
        <Wallet size={14} aria-hidden="true" />
        {pending ? 'Opening…' : 'Connect wallet'}
      </button>
    );
  }

  if (!access.isCorrectNetwork) {
    return (
      <button
        type="button"
        onClick={() => runAction(() => switchNetwork(robinhoodChain))}
        disabled={pending}
        className="inline-flex min-h-9 items-center justify-center gap-2 border border-[#f6c453] px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f6c453] transition-colors hover:bg-[#f6c453] hover:text-[#0d0e0c] disabled:opacity-50"
      >
        <Network size={14} aria-hidden="true" />
        {pending ? 'Switching…' : 'Switch network'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open({ view: 'Account' })}
      className="inline-flex min-h-9 items-center justify-center gap-2 border border-[#35412c] px-3 font-mono text-[10px] uppercase tracking-wider text-[#efffca] transition-colors hover:border-[#d7ff32]"
      title={access.address}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#d7ff32] shadow-[0_0_8px_#d7ff32]" />
      {shortAddress(access.address ?? '')}
    </button>
  );
}

export function WalletAccess() {
  const { open } = useAppKit();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const access = useConsoleAccess();
  const [actionError, setActionError] = useState('');
  const [pendingAction, setPendingAction] = useState<'connect' | 'switch' | 'disconnect' | null>(null);

  const disconnect = async () => {
    if (!appKit) return;
    setActionError('');
    setPendingAction('disconnect');
    try {
      await appKit.disconnect();
    } catch {
      setActionError('The wallet could not be disconnected. Please try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const connect = async () => {
    setActionError('');
    setPendingAction('connect');
    try {
      await open();
    } catch {
      setActionError('The wallet connection window could not be opened. Please try again.');
    } finally {
      setPendingAction(null);
    }
  };

  const switchToRobinhood = async () => {
    setActionError('');
    setPendingAction('switch');
    try {
      await switchNetwork(robinhoodChain);
    } catch {
      setActionError('The network switch was not completed. Approve Robinhood Chain in your wallet and try again.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="border border-[#d7ff32]/25 bg-[#0d100b] p-5 sm:p-6" aria-labelledby="wallet-access-heading">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Wallet size={20} className="shrink-0 text-[#d7ff32]" aria-hidden="true" />
            <h2 id="wallet-access-heading" className="text-xl font-medium text-[#efffca]">Console access</h2>
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed" aria-live="polite">
            {!access.isConnected ? (
              <>
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#f6c453]" aria-hidden="true" />
                <p className="text-[#c7d0bf]">Connect a wallet to unlock CPU Console controls. No transaction or signature is requested.</p>
              </>
            ) : !access.isCorrectNetwork ? (
              <>
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#f6c453]" aria-hidden="true" />
                <p className="text-[#c7d0bf]">Wrong network. Switch to Robinhood Chain (chain ID 4663) to use the console.</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#d7ff32]" aria-hidden="true" />
                <p className="text-[#c7d0bf]">
                  Connected as <span className="font-mono text-[#efffca]">{shortAddress(access.address ?? '')}</span> on Robinhood Chain.
                </p>
              </>
            )}
          </div>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-[#7e8878]">
            <div><dt className="inline">Status: </dt><dd className="inline text-[#c7d0bf]">{access.status ?? 'disconnected'}</dd></div>
            {access.isConnected && <div><dt className="inline">Address: </dt><dd className="inline text-[#c7d0bf]">{shortAddress(access.address ?? '')}</dd></div>}
            {chainId && <div><dt className="inline">Chain ID: </dt><dd className="inline text-[#c7d0bf]">{String(chainId)}</dd></div>}
          </dl>
          {actionError && <p className="mt-3 text-sm text-[#f0adad]" role="alert">{actionError}</p>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {!access.isConnected ? (
            <button
              type="button"
              onClick={connect}
              disabled={pendingAction !== null}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] transition-colors hover:bg-[#e4ff74]"
            >
              <Wallet size={16} aria-hidden="true" />
              {pendingAction === 'connect' ? 'Opening…' : 'Connect wallet'}
            </button>
          ) : (
            <>
              {!access.isCorrectNetwork && (
                <button
                  type="button"
                  onClick={switchToRobinhood}
                  disabled={pendingAction !== null}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] transition-colors hover:bg-[#e4ff74]"
                >
                  <Network size={16} aria-hidden="true" />
                  {pendingAction === 'switch' ? 'Switching…' : 'Switch network'}
                </button>
              )}
              <button
                type="button"
                onClick={disconnect}
                disabled={pendingAction !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#35412c] px-5 py-3 font-mono text-xs uppercase tracking-wider text-[#c7d0bf] transition-colors hover:border-[#d7ff32] hover:text-[#d7ff32]"
              >
                <LogOut size={16} aria-hidden="true" />
                {pendingAction === 'disconnect' ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}