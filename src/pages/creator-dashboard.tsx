import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import {
  getListCreatorGenesisLaunchesQueryKey,
  getListGenesisLaunchesQueryKey,
  useListCreatorGenesisLaunches,
} from '@api-client';
import { useQueryClient } from '@tanstack/react-query';
import { usePublicClient, useWriteContract } from 'wagmi';
import { CheckCircle2, LoaderCircle, Wallet } from 'lucide-react';
import { GenesisLaunchCard } from '../components/genesis-launch-card';
import { useConsoleAccess } from '../components/wallet-access';

const feeVaultAbi = [{
  type: 'function',
  name: 'claimCreator',
  stateMutability: 'nonpayable',
  inputs: [],
  outputs: [],
}] as const;

const feeVaultReadAbi = [
  { type: 'function', name: 'creator', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'genesisToken', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const;

const factoryAbi = [{
  type: 'function',
  name: 'feeVaultOf',
  stateMutability: 'view',
  inputs: [{ name: 'token', type: 'address' }],
  outputs: [{ type: 'address' }],
}] as const;

const GENESIS_FACTORY_ADDRESSES = {
  v1: '0x7f72E3546f625BC36Ae107F37062A06AC847f3C4',
  v2: '0x100D6f949c1C6751799EB510765Bcd7a3e65834A',
} as const;

function ClaimButton({
  vault,
  token,
  version,
  walletAddress,
}: {
  vault: `0x${string}`;
  token: `0x${string}`;
  version: keyof typeof GENESIS_FACTORY_ADDRESSES;
  walletAddress: string;
}) {
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [receiptHash, setReceiptHash] = useState('');
  const [error, setError] = useState('');
  const [claimState, setClaimState] = useState<'idle' | 'verifying' | 'confirming'>('idle');

  const claim = async () => {
    setError('');
    setReceiptHash('');
    setClaimState('verifying');
    try {
      if (!publicClient) throw new Error('Robinhood Chain client unavailable.');
      const [factoryVault, vaultCreator, vaultToken] = await Promise.all([
        publicClient.readContract({ address: GENESIS_FACTORY_ADDRESSES[version], abi: factoryAbi, functionName: 'feeVaultOf', args: [token] }),
        publicClient.readContract({ address: vault, abi: feeVaultReadAbi, functionName: 'creator' }),
        publicClient.readContract({ address: vault, abi: feeVaultReadAbi, functionName: 'genesisToken' }),
      ]);
      if (
        factoryVault.toLowerCase() !== vault.toLowerCase()
        || vaultCreator.toLowerCase() !== walletAddress.toLowerCase()
        || vaultToken.toLowerCase() !== token.toLowerCase()
      ) {
        throw new Error('FeeVault binding does not match the connected creator.');
      }
      const simulation = await publicClient.simulateContract({
        account: walletAddress as `0x${string}`,
        address: vault,
        abi: feeVaultAbi,
        functionName: 'claimCreator',
      });
      const hash = await writeContractAsync(simulation.request);
      setClaimState('confirming');
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      if (!receipt || receipt.status !== 'success') throw new Error('Claim transaction was not confirmed.');
      setReceiptHash(hash);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListCreatorGenesisLaunchesQueryKey(walletAddress) }),
        queryClient.invalidateQueries({ queryKey: getListGenesisLaunchesQueryKey() }),
      ]);
    } catch {
      setError('Claim was not completed. Confirm this wallet is the vault creator and try again.');
    } finally {
      setClaimState('idle');
    }
  };

  const busy = isPending || claimState !== 'idle';

  return (
    <div>
      <button type="button" onClick={() => void claim()} disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0d0e0c] hover:bg-[#e4ff74] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Wallet size={14} />}
        {claimState === 'verifying' ? 'Verifying FeeVault…' : claimState === 'confirming' || isPending ? 'Confirming claim…' : 'Claim creator fees'}
      </button>
      {receiptHash && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-[#d7ff32]"><CheckCircle2 size={14} /> Claim confirmed: {receiptHash.slice(0, 10)}…</p>}
      {error && <p role="alert" className="mt-3 text-xs text-[#f0adad]">{error}</p>}
    </div>
  );
}

export function CreatorDashboardPage() {
  const access = useConsoleAccess();
  const { open } = useAppKit();
  const walletAddress = access.address ?? '';
  const launches = useListCreatorGenesisLaunches(walletAddress, {
    query: {
      queryKey: getListCreatorGenesisLaunchesQueryKey(walletAddress),
      enabled: access.isReady && Boolean(walletAddress),
      refetchInterval: 15_000,
    },
  });

  return (
    <main className="section-shell py-12 sm:py-16">
      <header className="border-b border-[#2a3621] pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#d7ff32]">Wallet-scoped controls</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#efffca] sm:text-5xl">Creator dashboard</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#88917d]">
          Manage verified Isogate Genesis launches and claim the creator&apos;s 70% FeeVault allocation.
          Claims are signed by your wallet and sent directly to each token&apos;s immutable vault.
        </p>
      </header>

      {!access.isReady ? (
        <section className="mt-8 border border-[#f6c453]/40 bg-[#f6c453]/5 p-6" aria-labelledby="dashboard-wallet-heading">
          <h2 id="dashboard-wallet-heading" className="text-lg font-medium text-[#efffca]">
            {access.isConnected ? 'Switch to Robinhood Chain' : 'Connect the creator wallet'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#88917d]">
            The dashboard only queries launches where the connected address is the on-chain creator.
          </p>
          <button type="button" onClick={() => void open()} className="mt-5 inline-flex min-h-11 items-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0d0e0c]">
            <Wallet size={14} /> {access.isConnected ? 'Open wallet network controls' : 'Connect wallet'}
          </button>
        </section>
      ) : launches.isLoading ? (
        <div className="mt-8 flex min-h-56 items-center justify-center border border-[#2a3621]">
          <LoaderCircle className="animate-spin text-[#d7ff32]" aria-label="Loading creator launches" />
        </div>
      ) : launches.isError ? (
        <div role="alert" className="mt-8 border border-[#7a3434] bg-[#241010] p-5 text-sm text-[#f0adad]">
          Creator launches or live FeeVault balances could not be verified.
        </div>
      ) : launches.data?.items.length ? (
        <section className="mt-8 grid gap-5" aria-label="Creator launches">
          {launches.data.items.map((launch) => {
            const hasClaim = [launch.creatorNativeDue, launch.creatorWethDue, launch.creatorGenesisTokenDue].some((value) => BigInt(value) > 0n);
            return (
              <GenesisLaunchCard
                key={launch.tokenAddress}
                launch={launch}
                actions={hasClaim
                  ? (
                    <ClaimButton
                      vault={launch.feeVaultAddress as `0x${string}`}
                      token={launch.tokenAddress as `0x${string}`}
                      version={launch.version}
                      walletAddress={walletAddress}
                    />
                  )
                  : <p className="font-mono text-[10px] uppercase tracking-wider text-[#687360]">No creator fees currently claimable</p>}
              />
            );
          })}
        </section>
      ) : (
        <section className="mt-8 border border-dashed border-[#35412c] px-6 py-16 text-center">
          <Wallet size={28} className="mx-auto text-[#46503e]" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-medium text-[#c7d0bf]">No launches for this creator wallet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#687360]">
            Completed launches appear after their deployment and liquidity receipts are verified and reconciled.
          </p>
          <a href="?page=genesis" className="mt-5 inline-flex min-h-10 items-center border border-[#d7ff32] px-4 font-mono text-[10px] uppercase tracking-wider text-[#d7ff32] hover:bg-[#d7ff32] hover:text-[#0d0e0c]">
            Create with Genesis
          </a>
        </section>
      )}
    </main>
  );
}