import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetGenesisArtQueryKey,
  getGetApprovedGenesisRecipeQueryKey,
  getGetGenesisDeploymentProofQueryKey,
  getListCreatorGenesisLaunchesQueryKey,
  getListGenesisLaunchesQueryKey,
  useGetApprovedGenesisRecipe,
  useGetGenesisDeploymentProofReadiness,
  useGetGenesisDeploymentProof,
  useIssueGenesisDeploymentProof,
  useReconcileGenesisLaunch,
  useApproveGenesisArt,
  useCreateGenesisApprovalChallenge,
  useGenerateGenesisArt,
  useGetGenesisArt,
  useListNetworkProviders,
  useUploadGenesisArtifact,
} from '@api-client';
import {
  Check,
  Cpu,
  Download,
  Image,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
  Upload,
  Wallet,
} from 'lucide-react';
import { useConsoleAccess } from './wallet-access';
import { useConfig, usePublicClient, useSignMessage, useWriteContract } from 'wagmi';
import { getAccount, getChainId } from 'wagmi/actions';
import { formatEther, parseEventLogs, parseEther, type Address, type Chain, type Hex } from 'viem';

const GRID_SIZE = 16;
const UPLOAD_LEASE_MS = 5 * 60_000;
const GENESIS_CHAIN_ID = 4663;
const GENESIS_CHAIN = {
  id: GENESIS_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [] as string[] } },
} as Chain;
const GENESIS_REGISTRY_ADDRESS = '0xB946ad99b17d741ABFCBCAec85F5a896a02C62fC' as Address;
const GENESIS_FACTORY_ADDRESS = '0x100D6f949c1C6751799EB510765Bcd7a3e65834A' as Address;
const GENESIS_COORDINATOR_ADDRESS = '0xf3c2CAe988356112a9584389DDb6bc7bf3258c52' as Address;
const CANONICAL_LAUNCH_NATIVE = '0.001';
const HOOK_PERMISSION_MASK = 1n << 13n;
const HOOK_SALT_BATCH = 8_192n;
const HOOK_SALT_LIMIT = 1_048_576n;
const EXPLORER_BASE_URL = 'https://explorer.mainnet.robinhood.com';

const identityProofAbi = [{
  type: 'function',
  name: 'identityDigest',
  stateMutability: 'view',
  inputs: [{
    name: 'proof',
    type: 'tuple',
    components: [
      { name: 'providerJobRef', type: 'bytes32' },
      { name: 'providerRef', type: 'bytes32' },
      { name: 'creator', type: 'address' },
      { name: 'factory', type: 'address' },
      { name: 'protocol', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'descriptionHash', type: 'bytes32' },
      { name: 'engineHash', type: 'bytes32' },
      { name: 'seedHash', type: 'bytes32' },
      { name: 'cpuDigest', type: 'bytes32' },
      { name: 'imageDigest', type: 'bytes32' },
      { name: 'logoUri', type: 'string' },
      { name: 'expiry', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  }],
  outputs: [{ type: 'bytes32' }],
}, {
  type: 'function',
  name: 'approvedIdentity',
  stateMutability: 'view',
  inputs: [{ name: 'genesisDigest', type: 'bytes32' }],
  outputs: [{
    type: 'tuple',
    components: [
      { name: 'creator', type: 'address' },
      { name: 'factory', type: 'address' },
      { name: 'protocol', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'logoUri', type: 'string' },
      { name: 'providerJobRef', type: 'bytes32' },
      { name: 'providerRef', type: 'bytes32' },
      { name: 'expiry', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'approved', type: 'bool' },
    ],
  }],
}, {
  type: 'function',
  name: 'approveIdentity',
  stateMutability: 'nonpayable',
  inputs: [
    {
      name: 'proof',
      type: 'tuple',
      components: [
        { name: 'providerJobRef', type: 'bytes32' },
        { name: 'providerRef', type: 'bytes32' },
        { name: 'creator', type: 'address' },
        { name: 'factory', type: 'address' },
        { name: 'protocol', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'descriptionHash', type: 'bytes32' },
        { name: 'engineHash', type: 'bytes32' },
        { name: 'seedHash', type: 'bytes32' },
        { name: 'cpuDigest', type: 'bytes32' },
        { name: 'imageDigest', type: 'bytes32' },
        { name: 'logoUri', type: 'string' },
        { name: 'expiry', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    { name: 'verifierSignature', type: 'bytes' },
  ],
  outputs: [],
}] as const;

const genesisFactoryAbi = [{
  type: 'function',
  name: 'tokenByGenesisDigest',
  stateMutability: 'view',
  inputs: [{ name: 'digest', type: 'bytes32' }],
  outputs: [{ type: 'address' }],
}, {
  type: 'function',
  name: 'deployGenesis',
  stateMutability: 'nonpayable',
  inputs: [{ name: 'genesisDigest_', type: 'bytes32' }],
  outputs: [{ name: 'token', type: 'address' }],
}, {
  type: 'function',
  name: 'launchGenesis',
  stateMutability: 'payable',
  inputs: [
    { name: 'token', type: 'address' },
    { name: 'hookSalt', type: 'uint256' },
  ],
  outputs: [],
}] as const;

const launchCoordinatorAbi = [{
  type: 'function',
  name: 'findHookSalt',
  stateMutability: 'view',
  inputs: [
    { name: 'token', type: 'address' },
    { name: 'start', type: 'uint256' },
    { name: 'attempts', type: 'uint256' },
  ],
  outputs: [
    { name: 'salt', type: 'uint256' },
    { name: 'predicted', type: 'address' },
  ],
}, {
  type: 'function',
  name: 'launched',
  stateMutability: 'view',
  inputs: [{ name: 'token', type: 'address' }],
  outputs: [{ type: 'bool' }],
}] as const;

const genesisDeployedEvent = {
  type: 'event',
  name: 'GenesisDeployed',
  inputs: [
    { name: 'genesisDigest', type: 'bytes32', indexed: true },
    { name: 'token', type: 'address', indexed: true },
    { name: 'creator', type: 'address', indexed: true },
    { name: 'name', type: 'string', indexed: false },
    { name: 'symbol_', type: 'string', indexed: false },
    { name: 'logoUri', type: 'string', indexed: false },
  ],
} as const;

const genesisLaunchedEvent = {
  type: 'event',
  name: 'GenesisLaunched',
  inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'creator', type: 'address', indexed: true },
    { name: 'recipient', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ],
} as const;

const genesisPoolLaunchedEvent = {
  type: 'event',
  name: 'GenesisPoolLaunched',
  inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'creator', type: 'address', indexed: true },
    { name: 'feeVault', type: 'address', indexed: true },
    { name: 'positionLock', type: 'address', indexed: false },
    { name: 'positionTokenId', type: 'uint256', indexed: false },
    { name: 'tickLower', type: 'int24', indexed: false },
    { name: 'tickUpper', type: 'int24', indexed: false },
    { name: 'tokenAmount', type: 'uint256', indexed: false },
    { name: 'nativeAmount', type: 'uint256', indexed: false },
    { name: 'tokenDust', type: 'uint256', indexed: false },
  ],
} as const;

type LaunchSession = {
  digest?: Hex;
  approvalTxHash?: Hex;
  deploymentTxHash?: Hex;
  tokenAddress?: Address;
  hookSalt?: string;
  launchTxHash?: Hex;
};

type RegistryIdentityProof = {
  providerJobRef: Hex;
  providerRef: Hex;
  creator: Address;
  factory: Address;
  protocol: Address;
  name: string;
  symbol: string;
  descriptionHash: Hex;
  engineHash: Hex;
  seedHash: Hex;
  cpuDigest: Hex;
  imageDigest: Hex;
  logoUri: string;
  expiry: bigint;
  nonce: bigint;
};

function launchExplorerUrl(type: 'tx' | 'address', value: string) {
  return `${EXPLORER_BASE_URL}/${type}/${value}`;
}

function safeSessionGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Session persistence is best-effort and must never interrupt a wallet flow.
  }
}

function safeSessionRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Session persistence is best-effort and must never interrupt a wallet flow.
  }
}

function rgb565ToCss(value: number) {
  const red = Math.round(((value >> 11) & 0x1f) * 255 / 31);
  const green = Math.round(((value >> 5) & 0x3f) * 255 / 63);
  const blue = Math.round((value & 0x1f) * 255 / 31);
  return `rgb(${red}, ${green}, ${blue})`;
}

function PixelPreview({ pixels, name }: { pixels: number[]; name: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      role="img"
      aria-label={`Canonical RGB565 CPU logo for ${name}`}
      className="aspect-square w-full max-w-[420px] bg-black [image-rendering:pixelated]"
      shapeRendering="crispEdges"
    >
      {pixels.map((pixel, index) => (
        <rect
          key={index}
          x={index % GRID_SIZE}
          y={Math.floor(index / GRID_SIZE)}
          width="1"
          height="1"
          fill={rgb565ToCss(pixel)}
        />
      ))}
    </svg>
  );
}

function Gate({
  number,
  passed,
  title,
  detail,
}: {
  number: string;
  passed: boolean;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex gap-3 border-b border-[#2a3621] py-4 last:border-0">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[9px] ${
        passed ? 'border-[#d7ff32] bg-[#d7ff32] text-[#0d0e0c]' : 'border-[#46503e] text-[#596252]'
      }`}>
        {passed ? <Check size={13} aria-hidden="true" /> : number}
      </span>
      <span>
        <span className={`block text-sm font-medium ${passed ? 'text-[#efffca]' : 'text-[#88917d]'}`}>{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#687360]">{detail}</span>
      </span>
    </li>
  );
}

export function GenesisArtEngine() {
  const access = useConsoleAccess();
  const [activeJobId, setActiveJobId] = useState('');
  const providers = useListNetworkProviders();
  const deploymentReadiness = useGetGenesisDeploymentProofReadiness();
  const queryClient = useQueryClient();
  const generateArt = useGenerateGenesisArt({
    mutation: {
      onSuccess: (job) => {
        setActiveJobId(job.jobId);
        if (access.address) safeSessionSet(`isogate-genesis-job:${access.address.toLowerCase()}`, job.jobId);
      },
    },
  });
  const approvedRecipe = useGetApprovedGenesisRecipe(access.address ?? '', {
    query: {
      queryKey: getGetApprovedGenesisRecipeQueryKey(access.address ?? ''),
      enabled: access.isReady && Boolean(access.address),
      retry: false,
    },
  });
  const approveArt = useApproveGenesisArt({
    mutation: {
      onSuccess: (approvedJob, variables) => {
        queryClient.setQueryData(
          getGetGenesisArtQueryKey(variables.jobId),
          approvedJob,
        );
        void queryClient.invalidateQueries({
          queryKey: getGetGenesisArtQueryKey(variables.jobId),
        });
      },
    },
  });
  const createApprovalChallenge = useCreateGenesisApprovalChallenge();
  const uploadArtifact = useUploadGenesisArtifact({
    mutation: {
      onSuccess: (uploadedJob, variables) => {
        queryClient.setQueryData(getGetGenesisArtQueryKey(variables.jobId), uploadedJob);
        void queryClient.invalidateQueries({ queryKey: getGetGenesisArtQueryKey(variables.jobId) });
      },
    },
  });
  const { signMessageAsync } = useSignMessage();
  const config = useConfig();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: walletWritePending } = useWriteContract();
  const reconcileGenesisLaunch = useReconcileGenesisLaunch();
  const [launchSession, setLaunchSession] = useState<LaunchSession>({});
  const [launchStatus, setLaunchStatus] = useState('idle');
  const [launchError, setLaunchError] = useState('');
  const [nativeLiquidity, setNativeLiquidity] = useState(CANONICAL_LAUNCH_NATIVE);
  const [launchConfirmed, setLaunchConfirmed] = useState(false);
  const [resetLaunchConfirmed, setResetLaunchConfirmed] = useState(false);
  const [resetLaunchPending, setResetLaunchPending] = useState(false);
  const [resetLaunchMessage, setResetLaunchMessage] = useState('');
  const submission = generateArt.data;
  const jobId = submission?.jobId || activeJobId || approvedRecipe.data?.providerJobId || '';
  const artJob = useGetGenesisArt(jobId, {
    query: {
      queryKey: getGetGenesisArtQueryKey(jobId),
      enabled: Boolean(jobId),
      refetchInterval: (query) => {
        const status = query.state.data?.status ?? submission?.status;
        const uploadStatus = query.state.data?.uploadStatus;
        return status && (
          !['completed', 'rejected'].includes(status)
          || (query.state.data?.approved && (uploadStatus === 'pending' || uploadStatus === 'uploading'))
        ) ? 1500 : false;
      },
    },
  });
  const deploymentProof = useGetGenesisDeploymentProof(jobId, {
    query: {
      queryKey: getGetGenesisDeploymentProofQueryKey(jobId),
      enabled: Boolean(jobId) && (artJob.data?.uploadStatus === 'uploaded' || approvedRecipe.data?.uploadStatus === 'uploaded'),
      retry: false,
    },
  });
  const issueDeploymentProof = useIssueGenesisDeploymentProof({
    mutation: {
      onSuccess: (proof) => {
        queryClient.setQueryData(getGetGenesisDeploymentProofQueryKey(jobId), { deploymentProof: proof });
      },
    },
  });
  const [attempt, setAttempt] = useState(0);
  const recoveredRecipe = approvedRecipe.data;
  const result = artJob.data?.result ?? (recoveredRecipe ? {
    tokenName: recoveredRecipe.tokenName,
    symbol: recoveredRecipe.symbol,
    description: recoveredRecipe.description,
    seed: recoveredRecipe.seed,
    pixels: recoveredRecipe.pixels,
    engineVersion: recoveredRecipe.engineVersion,
    cycles: recoveredRecipe.cycles,
    cpuDigest: recoveredRecipe.cpuDigest,
    imageDigest: recoveredRecipe.imageDigest,
    width: 16,
    height: 16,
    colorModel: 'RGB565',
    bitsPerPixel: 16,
  } : null);

  useEffect(() => {
    if (!access.address) {
      setActiveJobId('');
      return;
    }
    const stored = safeSessionGet(`isogate-genesis-job:${access.address.toLowerCase()}`);
    setActiveJobId(approvedRecipe.data?.providerJobId ?? stored ?? '');
  }, [access.address, approvedRecipe.data?.providerJobId]);

  useEffect(() => {
    if (!access.address || !jobId) {
      setLaunchSession({});
      return;
    }
    const key = `isogate-genesis-launch:${access.address.toLowerCase()}:${jobId}`;
    const stored = safeSessionGet(key);
    if (!stored) {
      setLaunchSession({});
      return;
    }
    try {
      setLaunchSession(JSON.parse(stored) as LaunchSession);
    } catch {
      safeSessionRemove(key);
      setLaunchSession({});
    }
  }, [access.address, jobId]);

  const boundProvider = useMemo(() => {
    const wallet = access.address?.toLowerCase();
    return providers.data?.find((provider) =>
      provider.walletAddress?.toLowerCase() === wallet && provider.status === 'online',
    );
  }, [access.address, providers.data]);

  const approved = Boolean(recoveredRecipe || (result && artJob.data?.approved));
  const nativeExecutionPassed = Boolean(recoveredRecipe) || artJob.data?.eligibleForApproval === true;
  const uploadStatus = artJob.data?.uploadStatus ?? recoveredRecipe?.uploadStatus;
  const uploadStartedAt = artJob.data?.uploadStartedAt ?? recoveredRecipe?.uploadStartedAt;
  const ipfsCid = artJob.data?.ipfsCid ?? recoveredRecipe?.ipfsCid;
  const logoUri = artJob.data?.logoUri ?? recoveredRecipe?.logoUri;
  const proof = issueDeploymentProof.data
    ?? deploymentProof.data?.deploymentProof
    ?? recoveredRecipe?.deploymentProof
    ?? null;
  const proofExpired = proof?.status === 'issued'
    && Number(proof.expiry) * 1000 <= Date.now();
  const proofValid = proof?.status === 'issued' && !proofExpired;
  const parsedNativeLiquidity = useMemo(() => {
    try {
      const value = parseEther(nativeLiquidity);
      return value > 0n ? value : null;
    } catch {
      return null;
    }
  }, [nativeLiquidity]);
  const uploadLeaseExpired = uploadStatus === 'uploading'
    && Boolean(uploadStartedAt)
    && Date.now() - new Date(uploadStartedAt!).getTime() >= UPLOAD_LEASE_MS;

  const generate = async () => {
    if (!access.isReady || !access.address || !boundProvider) return;
    const nextAttempt = attempt + 1;
    const source = new TextEncoder().encode(
      `isogate-cpu-art-rgb565-v1|${access.address.toLowerCase()}|${boundProvider.reportDigest}|${nextAttempt}`,
    );
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', source));
    setAttempt(nextAttempt);
    generateArt.mutate({
      data: {
        seed: Array.from(digest.slice(0, 8)),
        providerId: boundProvider.id,
        creatorWalletAddress: access.address,
      },
    });
  };

  const downloadPng = async () => {
    if (!result || !submission?.jobId) return;
    const download = await fetch(`/api/genesis/art/${submission.jobId}/png`);
    if (!download.ok) return;
    const blob = await download.blob();
    const link = document.createElement('a');
    link.download = `${result.symbol.toLowerCase()}-${result.imageDigest.slice(0, 10)}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const approve = async () => {
    if (!jobId || !access.address || !signMessageAsync) return;
    try {
      const challenge = await createApprovalChallenge.mutateAsync({
        jobId,
        data: { creatorWalletAddress: access.address },
      });
      const signature = await signMessageAsync({ message: challenge.message });
      await approveArt.mutateAsync({
        jobId,
        data: {
          creatorWalletAddress: access.address,
          chainId: challenge.chainId,
          expiresAt: challenge.expiresAt,
          nonce: challenge.nonce,
          signature,
        },
      });
    } catch {
      // The mutation and wallet providers expose their own generic UI state;
      // do not surface provider error payloads, which may contain internals.
    }
  };

  const upload = () => {
    if (!jobId) return;
    uploadArtifact.mutate({ jobId });
  };

  const requestDeploymentProof = () => {
    if (!jobId || uploadStatus !== 'uploaded') return;
    issueDeploymentProof.mutate({ jobId });
  };

  const persistLaunchSession = (patch: LaunchSession, replace = false) => {
    setLaunchSession((previous) => {
      const next = replace ? patch : { ...previous, ...patch };
      if (access.address && jobId) {
        safeSessionSet(
          `isogate-genesis-launch:${access.address.toLowerCase()}:${jobId}`,
          JSON.stringify(next),
        );
      }
      return next;
    });
  };

  const clearLaunchSessionHash = (field: 'approvalTxHash' | 'deploymentTxHash' | 'launchTxHash') => {
    setLaunchSession((previous) => {
      const next = { ...previous };
      delete next[field];
      if (access.address && jobId) {
        safeSessionSet(
          `isogate-genesis-launch:${access.address.toLowerCase()}:${jobId}`,
          JSON.stringify(next),
        );
      }
      return next;
    });
  };

  const assertCurrentWallet = () => {
    const currentAccount = getAccount(config);
    const currentChain = getChainId(config);
    if (!currentAccount.address || currentAccount.address.toLowerCase() !== access.address?.toLowerCase()) {
      throw new Error('Connected creator wallet changed; launch paused before the next transaction.');
    }
    if (currentChain !== GENESIS_CHAIN_ID) {
      throw new Error(`Connected wallet is on chain ${currentChain}; switch to Robinhood Chain ${GENESIS_CHAIN_ID}.`);
    }
    return currentAccount.address as Address;
  };

  const readDeploymentReceiptToken = async (hash: Hex, digest: Hex, expectedToken: Address | undefined, creator: Address) => {
    if (!publicClient) return undefined;
    const receipt = await publicClient.getTransactionReceipt({ hash });
    if (
      receipt.status !== 'success'
      || !receipt.to
      || receipt.to.toLowerCase() !== GENESIS_FACTORY_ADDRESS.toLowerCase()
    ) return undefined;
    const events = parseEventLogs({
      abi: [genesisDeployedEvent],
      eventName: 'GenesisDeployed',
      logs: receipt.logs,
      strict: false,
    });
    for (const event of events) {
      const args = event.args as { genesisDigest?: Hex; token?: Address; creator?: Address };
      if (
        event.address.toLowerCase() === GENESIS_FACTORY_ADDRESS.toLowerCase()
        && args.genesisDigest?.toLowerCase() === digest.toLowerCase()
        && args.token
        && (!expectedToken || args.token.toLowerCase() === expectedToken.toLowerCase())
        && args.creator?.toLowerCase() === creator.toLowerCase()
      ) return args.token;
    }
    return undefined;
  };

  const readLaunchReceipt = async (hash: Hex, token: Address, creator: Address) => {
    if (!publicClient) return false;
    const receipt = await publicClient.getTransactionReceipt({ hash });
    if (
      receipt.status !== 'success'
      || !receipt.to
      || receipt.to.toLowerCase() !== GENESIS_FACTORY_ADDRESS.toLowerCase()
    ) return false;
    const factoryEvents = parseEventLogs({
      abi: [genesisLaunchedEvent],
      eventName: 'GenesisLaunched',
      logs: receipt.logs,
      strict: false,
    });
    const factoryMatch = factoryEvents.some((event) => {
      const args = event.args as { token?: Address; creator?: Address; recipient?: Address };
      return event.address.toLowerCase() === GENESIS_FACTORY_ADDRESS.toLowerCase()
        && args.token?.toLowerCase() === token.toLowerCase()
        && args.creator?.toLowerCase() === creator.toLowerCase()
        && args.recipient?.toLowerCase() === GENESIS_COORDINATOR_ADDRESS.toLowerCase();
    });
    if (!factoryMatch) return false;
    const coordinatorEvents = parseEventLogs({
      abi: [genesisPoolLaunchedEvent],
      eventName: 'GenesisPoolLaunched',
      logs: receipt.logs,
      strict: false,
    });
    return coordinatorEvents.some((event) => {
      const args = event.args as { token?: Address; creator?: Address };
      return event.address.toLowerCase() === GENESIS_COORDINATOR_ADDRESS.toLowerCase()
        && args.token?.toLowerCase() === token.toLowerCase()
        && args.creator?.toLowerCase() === creator.toLowerCase();
    });
  };

  const recoverDeploymentTxHash = async (digest: Hex, token: Address | undefined, creator: Address) => {
    if (!publicClient) return undefined;
    const logs = await publicClient.getLogs({
      address: GENESIS_FACTORY_ADDRESS,
      event: genesisDeployedEvent,
      args: token
        ? { genesisDigest: digest, token, creator }
        : { genesisDigest: digest, creator },
      fromBlock: 0n,
      toBlock: 'latest',
    });
    for (const log of logs) {
      const args = log.args as { genesisDigest?: Hex; token?: Address; creator?: Address };
      if (
        !log.transactionHash
        || log.address.toLowerCase() !== GENESIS_FACTORY_ADDRESS.toLowerCase()
        || args.genesisDigest?.toLowerCase() !== digest.toLowerCase()
        || !args.token
        || (token && args.token.toLowerCase() !== token.toLowerCase())
        || args.creator?.toLowerCase() !== creator.toLowerCase()
      ) continue;
      if (await readDeploymentReceiptToken(log.transactionHash, digest, token, creator)) return log.transactionHash;
    }
    return undefined;
  };

  const recoverLaunchTxHash = async (token: Address, creator: Address) => {
    if (!publicClient) return undefined;
    const factoryLogs = await publicClient.getLogs({
      address: GENESIS_FACTORY_ADDRESS,
      event: genesisLaunchedEvent,
      args: { token, creator },
      fromBlock: 0n,
      toBlock: 'latest',
    });
    for (const log of factoryLogs) {
      const args = log.args as { token?: Address; creator?: Address; recipient?: Address };
      if (
        log.transactionHash
        && log.address.toLowerCase() === GENESIS_FACTORY_ADDRESS.toLowerCase()
        && args.token?.toLowerCase() === token.toLowerCase()
        && args.creator?.toLowerCase() === creator.toLowerCase()
        && args.recipient?.toLowerCase() === GENESIS_COORDINATOR_ADDRESS.toLowerCase()
        && await readLaunchReceipt(log.transactionHash, token, creator)
      ) return log.transactionHash;
    }
    const coordinatorLogs = await publicClient.getLogs({
      address: GENESIS_COORDINATOR_ADDRESS,
      event: genesisPoolLaunchedEvent,
      args: { token, creator },
      fromBlock: 0n,
      toBlock: 'latest',
    });
    for (const log of coordinatorLogs) {
      const args = log.args as { token?: Address; creator?: Address };
      if (
        log.transactionHash
        && log.address.toLowerCase() === GENESIS_COORDINATOR_ADDRESS.toLowerCase()
        && args.token?.toLowerCase() === token.toLowerCase()
        && args.creator?.toLowerCase() === creator.toLowerCase()
        && await readLaunchReceipt(log.transactionHash, token, creator)
      ) return log.transactionHash;
    }
    return undefined;
  };

  const resetLocalLaunchRecovery = async () => {
    if (!resetLaunchConfirmed || !access.address || !jobId || !publicClient) return;
    setResetLaunchPending(true);
    setResetLaunchMessage('');
    try {
      const digest = launchSession.digest;
      const currentBlock = await publicClient.getBlockNumber();
      let chainState = `Chain re-read at block ${currentBlock}: no digest hint was stored; no chain state was changed.`;
      if (digest) {
        const tokenAddress = await publicClient.readContract({
          address: GENESIS_FACTORY_ADDRESS,
          abi: genesisFactoryAbi,
          functionName: 'tokenByGenesisDigest',
          args: [digest],
        }) as Address;
        const approvedIdentity = await publicClient.readContract({
          address: GENESIS_REGISTRY_ADDRESS,
          abi: identityProofAbi,
          functionName: 'approvedIdentity',
          args: [digest],
        }) as { approved: boolean };
        const launched = tokenAddress !== '0x0000000000000000000000000000000000000000'
          ? await publicClient.readContract({
            address: GENESIS_COORDINATOR_ADDRESS,
            abi: launchCoordinatorAbi,
            functionName: 'launched',
            args: [tokenAddress],
          })
          : false;
        chainState = `Chain re-read: Registry approved=${approvedIdentity.approved}, token=${tokenAddress}, Coordinator launched=${launched}.`;
      }
      safeSessionRemove(`isogate-genesis-launch:${access.address.toLowerCase()}:${jobId}`);
      setLaunchSession({});
      setResetLaunchConfirmed(false);
      setResetLaunchMessage(`${chainState} Local recovery hints cleared only; no chain or backend state was changed.`);
    } catch {
      setResetLaunchMessage('Could not re-read chain state; local recovery hints were retained.');
    } finally {
      setResetLaunchPending(false);
    }
  };

  const launchEligible = Boolean(
    access.isReady
      && access.address
      && recoveredRecipe
      && approved
      && nativeExecutionPassed
      && uploadStatus === 'uploaded'
      && proof?.status === 'issued'
      && deploymentReadiness.data?.ready === true,
  );
  const launchComplete = Boolean(launchSession.launchTxHash && launchSession.tokenAddress);

  const launch = async () => {
    if (!launchEligible || !proof || !access.address || !publicClient || !jobId) return;
    setLaunchError('');
    setLaunchStatus('Checking Robinhood Chain 4663 and existing launch state…');
    try {
      assertCurrentWallet();
      if (proof.factory.toLowerCase() !== GENESIS_FACTORY_ADDRESS.toLowerCase()) {
        throw new Error('Deployment proof factory does not match the reviewed mainnet factory.');
      }
      if (proof.creator.toLowerCase() !== access.address.toLowerCase()) {
        throw new Error('Deployment proof creator does not match the connected wallet.');
      }
      const amount = parsedNativeLiquidity;
      if (amount === null) throw new Error('Enter a valid native liquidity amount greater than zero with at most 18 decimal places.');
      if (!launchConfirmed) throw new Error('Confirm the irreversible launch steps before continuing.');

      const registryProof: RegistryIdentityProof = {
        providerJobRef: proof.providerJobRef as Hex,
        providerRef: proof.providerRef as Hex,
        creator: proof.creator as Address,
        factory: proof.factory as Address,
        protocol: proof.protocol as Address,
        name: proof.tokenName,
        symbol: proof.symbol,
        descriptionHash: proof.descriptionHash as Hex,
        engineHash: proof.engineHash as Hex,
        seedHash: proof.seedHash as Hex,
        cpuDigest: proof.cpuDigest as Hex,
        imageDigest: proof.imageDigest as Hex,
        logoUri: proof.logoUri,
        expiry: BigInt(proof.expiry),
        nonce: BigInt(proof.nonce),
      };
      const digest = await publicClient.readContract({
        address: GENESIS_REGISTRY_ADDRESS,
        abi: identityProofAbi,
        functionName: 'identityDigest',
        args: [registryProof],
      }) as Hex;
      if (proof.digest.toLowerCase() !== digest.toLowerCase()) {
        throw new Error('Issued proof digest does not match the Registry identityDigest.');
      }
      const existingSession = launchSession.digest === digest ? launchSession : {};
      let deploymentTxHash = existingSession.deploymentTxHash;
      persistLaunchSession({ digest }, launchSession.digest !== digest);

      let approvedIdentity = await publicClient.readContract({
        address: GENESIS_REGISTRY_ADDRESS,
        abi: identityProofAbi,
        functionName: 'approvedIdentity',
        args: [digest],
      }) as { creator: Address; factory: Address; approved: boolean };
      if (!approvedIdentity.approved && existingSession.approvalTxHash) {
        try {
          setLaunchStatus('Checking the saved Registry approval receipt…');
          const approvalReceipt = await publicClient.waitForTransactionReceipt({ hash: existingSession.approvalTxHash });
          if (approvalReceipt.status !== 'success') throw new Error('Registry approval transaction failed.');
          approvedIdentity = await publicClient.readContract({
            address: GENESIS_REGISTRY_ADDRESS,
            abi: identityProofAbi,
            functionName: 'approvedIdentity',
            args: [digest],
          }) as { creator: Address; factory: Address; approved: boolean };
        } catch {
          clearLaunchSessionHash('approvalTxHash');
        }
      }
      if (approvedIdentity.approved) {
        if (
          approvedIdentity.creator.toLowerCase() !== access.address.toLowerCase()
          || approvedIdentity.factory.toLowerCase() !== GENESIS_FACTORY_ADDRESS.toLowerCase()
        ) {
          throw new Error('The approved Registry identity is bound to a different creator or factory.');
        }
        setLaunchStatus('Registry identity already approved; safely resuming.');
      } else {
        if (proofExpired) {
          throw new Error('Deployment proof expired. Issue a fresh proof before Registry approval.');
        }
        setLaunchStatus('Simulating Registry approval…');
        const accountBeforeApproval = assertCurrentWallet();
        const approvalSimulation = await publicClient.simulateContract({
          account: accountBeforeApproval,
          chain: GENESIS_CHAIN,
          address: GENESIS_REGISTRY_ADDRESS,
          abi: identityProofAbi,
          functionName: 'approveIdentity',
          args: [registryProof, proof.signature as Hex],
        });
        const accountAtApprovalWrite = assertCurrentWallet();
        if (accountAtApprovalWrite.toLowerCase() !== accountBeforeApproval.toLowerCase()) {
          throw new Error('Connected creator wallet changed while preparing Registry approval.');
        }
        const approvalHash = await writeContractAsync({ ...approvalSimulation.request, chainId: GENESIS_CHAIN_ID });
        persistLaunchSession({ digest, approvalTxHash: approvalHash });
        setLaunchStatus('Waiting for Registry approval receipt…');
        try {
          const approvalReceipt = await publicClient.waitForTransactionReceipt({ hash: approvalHash });
          if (approvalReceipt.status !== 'success') throw new Error('Registry approval transaction failed.');
        } catch {
          clearLaunchSessionHash('approvalTxHash');
          throw new Error('Registry approval transaction failed; its hash was cleared so approval can be retried.');
        }
        approvedIdentity = await publicClient.readContract({
          address: GENESIS_REGISTRY_ADDRESS,
          abi: identityProofAbi,
          functionName: 'approvedIdentity',
          args: [digest],
        }) as { creator: Address; factory: Address; approved: boolean };
        if (!approvedIdentity.approved) throw new Error('Registry approval receipt succeeded, but approvedIdentity is still false.');
      }

      let tokenAddress = await publicClient.readContract({
        address: GENESIS_FACTORY_ADDRESS,
        abi: genesisFactoryAbi,
        functionName: 'tokenByGenesisDigest',
        args: [digest],
      }) as Address;
      let deploymentReceiptAccepted = false;
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        if (deploymentTxHash) {
          const restoredToken = await readDeploymentReceiptToken(
            deploymentTxHash,
            digest,
            undefined,
            access.address as Address,
          ).catch(() => undefined);
          if (restoredToken) {
            deploymentReceiptAccepted = true;
          } else {
            clearLaunchSessionHash('deploymentTxHash');
            deploymentTxHash = undefined;
          }
        }
        if (!deploymentTxHash) {
          const recoveredDeploymentHash = await recoverDeploymentTxHash(digest, undefined, access.address as Address);
          if (recoveredDeploymentHash) {
            deploymentTxHash = recoveredDeploymentHash;
            deploymentReceiptAccepted = true;
            persistLaunchSession({ digest, deploymentTxHash });
          }
        }
        if (!deploymentTxHash) {
          setLaunchStatus('Simulating Genesis token deployment…');
          const accountBeforeDeployment = assertCurrentWallet();
          const deploymentSimulation = await publicClient.simulateContract({
            account: accountBeforeDeployment,
            chain: GENESIS_CHAIN,
            address: GENESIS_FACTORY_ADDRESS,
            abi: genesisFactoryAbi,
            functionName: 'deployGenesis',
            args: [digest],
          });
          const accountAtDeploymentWrite = assertCurrentWallet();
          if (accountAtDeploymentWrite.toLowerCase() !== accountBeforeDeployment.toLowerCase()) {
            throw new Error('Connected creator wallet changed while preparing token deployment.');
          }
          const nextDeploymentHash = await writeContractAsync({ ...deploymentSimulation.request, chainId: GENESIS_CHAIN_ID });
          deploymentTxHash = nextDeploymentHash;
          persistLaunchSession({ digest, deploymentTxHash: nextDeploymentHash });
          setLaunchStatus('Waiting for Genesis token deployment receipt…');
          try {
            const deploymentReceipt = await publicClient.waitForTransactionReceipt({ hash: nextDeploymentHash });
            if (deploymentReceipt.status !== 'success') throw new Error('Genesis token deployment transaction failed.');
            deploymentReceiptAccepted = Boolean(await readDeploymentReceiptToken(
              nextDeploymentHash,
              digest,
              undefined,
              access.address as Address,
            ));
            if (!deploymentReceiptAccepted) throw new Error('Deployment receipt did not contain the exact Factory GenesisDeployed event.');
          } catch {
            clearLaunchSessionHash('deploymentTxHash');
            deploymentTxHash = undefined;
            throw new Error('Genesis token deployment transaction failed; its hash was cleared so deployment can be retried.');
          }
        }
        tokenAddress = await publicClient.readContract({
          address: GENESIS_FACTORY_ADDRESS,
          abi: genesisFactoryAbi,
          functionName: 'tokenByGenesisDigest',
          args: [digest],
        }) as Address;
      }
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        if (deploymentReceiptAccepted) {
          throw new Error('A canonical GenesisDeployed event exists, but tokenByGenesisDigest is still empty.');
        }
        throw new Error('Factory deployment receipt succeeded, but tokenByGenesisDigest is still empty.');
      }
      if (!deploymentTxHash) {
        deploymentTxHash = await recoverDeploymentTxHash(digest, tokenAddress, access.address as Address);
        if (deploymentTxHash) {
          persistLaunchSession({ digest, tokenAddress, deploymentTxHash });
        } else {
          throw new Error('Factory has a token mapping, but its GenesisDeployed transaction could not be recovered. Launch is paused to preserve reconciliation safety.');
        }
      }
      if (!deploymentReceiptAccepted) {
        const restoredToken = await readDeploymentReceiptToken(
          deploymentTxHash,
          digest,
          tokenAddress,
          access.address as Address,
        ).catch(() => undefined);
        if (!restoredToken) {
          clearLaunchSessionHash('deploymentTxHash');
          const recoveredDeploymentHash = await recoverDeploymentTxHash(digest, tokenAddress, access.address as Address);
          if (!recoveredDeploymentHash) {
            throw new Error('Saved deployment hash was not an authoritative Factory GenesisDeployed receipt; no canonical deployment log was found.');
          }
          deploymentTxHash = recoveredDeploymentHash;
          persistLaunchSession({ digest, tokenAddress, deploymentTxHash });
        }
      }
      persistLaunchSession({ digest, tokenAddress });

      let launchHash = existingSession.launchTxHash;
      let launchReceiptAccepted = false;
      if (launchHash) {
        launchReceiptAccepted = await readLaunchReceipt(
          launchHash,
          tokenAddress,
          access.address as Address,
        ).catch(() => false);
        if (!launchReceiptAccepted) {
          clearLaunchSessionHash('launchTxHash');
          launchHash = undefined;
        }
      }
      let coordinatorHasLaunched = await publicClient.readContract({
        address: GENESIS_COORDINATOR_ADDRESS,
        abi: launchCoordinatorAbi,
        functionName: 'launched',
        args: [tokenAddress],
      });
      if (coordinatorHasLaunched && !launchHash) {
        launchHash = await recoverLaunchTxHash(tokenAddress, access.address as Address);
        if (launchHash) {
          launchReceiptAccepted = true;
          persistLaunchSession({ digest, tokenAddress, launchTxHash: launchHash });
        }
      }
      if (coordinatorHasLaunched && !launchHash) {
        throw new Error('This token is already launched, but its Genesis launch transaction could not be recovered.');
      }
      if (!coordinatorHasLaunched && !launchHash) {
        let hookSalt = existingSession.hookSalt
          ? BigInt(existingSession.hookSalt)
          : undefined;
        if (hookSalt === undefined) {
          setLaunchStatus('Mining a valid CREATE2 hook salt in read-only batches…');
          for (let start = 0n; start < HOOK_SALT_LIMIT; start += HOOK_SALT_BATCH) {
            setLaunchStatus(`Mining hook salt: ${start.toLocaleString()}–${(start + HOOK_SALT_BATCH - 1n).toLocaleString()} of ${HOOK_SALT_LIMIT.toLocaleString()}…`);
            try {
              const [candidateSalt, predicted] = await publicClient.readContract({
                address: GENESIS_COORDINATOR_ADDRESS,
                abi: launchCoordinatorAbi,
                functionName: 'findHookSalt',
                args: [tokenAddress, start, HOOK_SALT_BATCH],
              });
              if ((BigInt(predicted) & 0x3fffn) === HOOK_PERMISSION_MASK) {
                hookSalt = candidateSalt;
                persistLaunchSession({ digest, tokenAddress, hookSalt: candidateSalt.toString() });
                break;
              }
            } catch {
              // A bounded eth_call that finds no salt reverts; continue read-only mining.
            }
          }
        }
        if (hookSalt === undefined) throw new Error('Unable to mine a valid hook salt within 1,048,576 read-only attempts.');
        setLaunchStatus(`Simulating Factory launchGenesis with ${formatEther(amount)} native value…`);
        const accountBeforeLaunch = assertCurrentWallet();
        const launchSimulation = await publicClient.simulateContract({
          account: accountBeforeLaunch,
          chain: GENESIS_CHAIN,
          address: GENESIS_FACTORY_ADDRESS,
          abi: genesisFactoryAbi,
          functionName: 'launchGenesis',
          args: [tokenAddress, hookSalt],
          value: amount,
        });
        const accountAtLaunchWrite = assertCurrentWallet();
        if (accountAtLaunchWrite.toLowerCase() !== accountBeforeLaunch.toLowerCase()) {
          throw new Error('Connected creator wallet changed while preparing liquidity launch.');
        }
        launchHash = await writeContractAsync({ ...launchSimulation.request, chainId: GENESIS_CHAIN_ID });
        persistLaunchSession({ digest, tokenAddress, hookSalt: hookSalt.toString(), launchTxHash: launchHash });
      }
      if (!launchHash) throw new Error('Launch transaction hash is unavailable.');
      if (!deploymentTxHash) {
        throw new Error('Deployment transaction hash was not saved; reconciliation cannot be completed safely.');
      }
      if (!coordinatorHasLaunched) {
        try {
          setLaunchStatus('Waiting for launch receipt and 13 confirmations (12 finalized blocks)…');
          const launchReceipt = await publicClient.waitForTransactionReceipt({ hash: launchHash, confirmations: 13 });
          if (launchReceipt.status !== 'success') throw new Error('Genesis liquidity launch transaction failed.');
          launchReceiptAccepted = await readLaunchReceipt(
            launchHash,
            tokenAddress,
            access.address as Address,
          );
          if (!launchReceiptAccepted) throw new Error('Launch receipt did not contain the exact Factory and Coordinator launch events.');
        } catch {
          const launchedAfterReceiptError = await publicClient.readContract({
            address: GENESIS_COORDINATOR_ADDRESS,
            abi: launchCoordinatorAbi,
            functionName: 'launched',
            args: [tokenAddress],
          });
          if (launchedAfterReceiptError) {
            coordinatorHasLaunched = true;
          } else {
            clearLaunchSessionHash('launchTxHash');
            throw new Error('Genesis liquidity launch transaction failed; the saved hash was cleared so it can be retried.');
          }
        }
        if (!coordinatorHasLaunched) {
          coordinatorHasLaunched = await publicClient.readContract({
            address: GENESIS_COORDINATOR_ADDRESS,
            abi: launchCoordinatorAbi,
            functionName: 'launched',
            args: [tokenAddress],
          });
        }
        if (!coordinatorHasLaunched) throw new Error('Launch receipt succeeded, but Coordinator launched(token) is still false.');
      } else {
        try {
          setLaunchStatus('Waiting for launch finality: 13 confirmations (12 finalized blocks)…');
          const launchReceipt = await publicClient.waitForTransactionReceipt({ hash: launchHash, confirmations: 13 });
          if (launchReceipt.status !== 'success') throw new Error('Genesis liquidity launch transaction failed.');
          if (!launchReceiptAccepted) {
            launchReceiptAccepted = await readLaunchReceipt(
              launchHash,
              tokenAddress,
              access.address as Address,
            );
            if (!launchReceiptAccepted) throw new Error('Saved launch receipt did not contain the exact Factory and Coordinator launch events.');
          }
        } catch {
          clearLaunchSessionHash('launchTxHash');
          throw new Error('Saved launch receipt failed; its hash was cleared so the canonical launch log can be recovered on retry.');
        }
      }
      const finalTokenAddress = await publicClient.readContract({
        address: GENESIS_FACTORY_ADDRESS,
        abi: genesisFactoryAbi,
        functionName: 'tokenByGenesisDigest',
        args: [digest],
      }) as Address;
      if (finalTokenAddress.toLowerCase() !== tokenAddress.toLowerCase()) {
        throw new Error('Factory token mapping changed unexpectedly after launch.');
      }
      setLaunchStatus('Reconciling the finalized launch with the verification network…');
      persistLaunchSession({ digest, tokenAddress: finalTokenAddress, launchTxHash: launchHash });
      const reconciliation = await reconcileGenesisLaunch.mutateAsync({
        data: {
          version: 'v2',
          deploymentTxHash,
          launchTxHash: launchHash,
        },
      });
      if ('status' in reconciliation && reconciliation.status === 'pending_indexing') {
        const pendingScanners = reconciliation.scanners
          .filter((scanner) => scanner.token !== 'exact_match' || scanner.hook !== 'exact_match')
          .map((scanner) => scanner.name)
          .join(', ');
        setLaunchError(`On-chain launch verified. Public source indexing is still pending${pendingScanners ? ` on ${pendingScanners}` : ''}. Retry to refresh indexing status.`);
        setLaunchStatus('idle');
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getListCreatorGenesisLaunchesQueryKey(access.address) }),
        queryClient.invalidateQueries({ queryKey: getListGenesisLaunchesQueryKey() }),
      ]);
      setLaunchStatus(`Launch finalized and source-indexed. Token contract address: ${finalTokenAddress}`);
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'Launch could not be completed.');
      setLaunchStatus('');
    }
  };

  const gates = [
    {
      passed: access.isReady,
      title: 'Creator wallet',
      detail: access.isReady ? 'Connected on Robinhood Chain.' : 'Connect the creator wallet on Robinhood Chain.',
    },
    {
      passed: Boolean(boundProvider),
      title: 'Wallet-bound Native Node',
      detail: boundProvider
        ? `${boundProvider.cpuVendor} ${boundProvider.cpuModel} is online.`
        : 'Register, bind, and run a Native Node with this wallet.',
    },
    {
      passed: Boolean(result),
      title: 'Canonical RGB565 candidate',
      detail: result
        ? 'Native Node returned the complete logo, name, symbol, description, and digests.'
        : 'Generate the complete identity bundle on the Native Node.',
    },
    {
      passed: nativeExecutionPassed,
      title: 'Native Node execution',
      detail: 'Required before deploy: the user node must execute the same workload and match server recomputation.',
    },
    {
      passed: approved && nativeExecutionPassed,
      title: 'Creator acknowledgment',
      detail: approved
        ? 'The exact verified bundle is recorded; the registry still requires a creator wallet transaction.'
        : 'Acknowledgment opens only after Native Node verification.',
    },
    {
      passed: uploadStatus === 'uploaded',
      title: 'IPFS artifact',
      detail: uploadStatus === 'uploaded'
        ? 'Canonical PNG is pinned and its CID is immutable.'
        : 'Upload the approved canonical PNG to IPFS before deployment.',
    },
    {
      passed: deploymentReadiness.data?.ready === true,
      title: 'Mainnet launch stack',
      detail: deploymentReadiness.data?.ready === true
        ? 'Registry, factory, coordinator, and dedicated verifier are live on Robinhood Chain.'
        : 'Launch remains fail-closed until the deployed contracts and verifier wiring pass server checks.',
    },
    {
      passed: proof?.status === 'issued',
      title: 'Deployment proof',
      detail: proofValid
        ? 'Short-lived EIP-712 identity proof issued for the deployed registry and factory.'
        : proofExpired
          ? 'This proof expired. Resume is allowed only if this digest is already Registry-approved; otherwise issue a fresh proof.'
        : uploadStatus === 'uploaded'
          ? 'Request a short-lived proof before signing the on-chain creator transaction.'
          : 'Available only after the immutable IPFS artifact is ready.',
    },
    {
      passed: launchComplete,
      title: 'Creator on-chain launch',
      detail: launchComplete
        ? 'On-chain launch receipts are finalized. Public completion still requires source indexing.'
        : proof?.status === 'issued'
          ? 'The creator must submit Registry approval, token deployment, and liquidity launch transactions.'
        : 'Locked until every preceding creator and server gate passes.',
    },
  ];

  return (
    <section className="mt-8" aria-labelledby="cpu-art-heading">
      <header className="mb-6 border-b border-[#2a3621] pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#d7ff32]">Stage 01 · Required gate</p>
        <h2 id="cpu-art-heading" className="mt-2 text-2xl font-semibold text-[#efffca]">Native CPU Identity Engine</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#88917d]">
          The CPU generates the logo, token name, symbol, and description as one reproducible deployment bundle.
          No identity field is typed or selected by the creator.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="order-2 border border-[#2a3621] bg-[#090b08] p-5 xl:order-1">
          <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#efffca]">
            <ShieldCheck size={15} className="text-[#d7ff32]" aria-hidden="true" />
            Pre-deploy gates
          </h3>
          <ol className="mt-3">
            {gates.map((gate, index) => <Gate key={gate.title} number={String(index + 1).padStart(2, '0')} {...gate} />)}
          </ol>
        </aside>

        <div className="order-1 border border-[#2a3621] bg-[#090b08] p-5 sm:p-7 xl:order-2">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
            <div>
              <div className="border border-[#2a3621] bg-[#0d100b] p-4">
                <div className="flex gap-3">
                  {boundProvider ? <Server size={18} className="shrink-0 text-[#d7ff32]" /> : <Wallet size={18} className="shrink-0 text-[#f6c453]" />}
                  <div>
                    <p className="text-sm text-[#c7d0bf]">
                      {!access.isReady
                        ? 'Connect the creator wallet first.'
                        : boundProvider
                          ? 'Wallet-bound Native Node found.'
                          : 'No online Native Node is bound to this wallet.'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#687360]">
                      {!access.isReady
                        ? 'Wallet connection is required before the page can match a wallet-bound provider.'
                        : !boundProvider
                          ? 'Open CPU Console, register a provider, bind this wallet, and keep the Native Node online.'
                          : 'Generation queues a deterministic job only; it does not request payment or deploy a contract.'}
                    </p>
                  </div>
                </div>
              </div>

              {access.isReady && !boundProvider ? (
                <a
                  href="?page=console"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-5 text-center font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] hover:bg-[#e4ff74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff32]"
                >
                  <Server size={16} aria-hidden="true" /> Set up Native Node in CPU Console
                </a>
              ) : (
                <button
                  type="button"
                  onClick={generate}
                  disabled={!access.isReady || !boundProvider || generateArt.isPending}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-5 font-mono text-xs font-bold uppercase tracking-wider text-[#0d0e0c] hover:bg-[#e4ff74] disabled:cursor-not-allowed disabled:border-[#35412c] disabled:bg-[#182014] disabled:text-[#596252]"
                >
                  {generateArt.isPending ? <LoaderCircle size={16} className="animate-spin" /> : result ? <RefreshCw size={16} /> : <Cpu size={16} />}
                  {generateArt.isPending ? 'Executing Native Node workload…' : result ? 'Generate new CPU bundle' : access.isReady ? 'Generate CPU bundle' : 'Connect creator wallet to continue'}
                </button>
              )}
              {generateArt.isError && <p role="alert" className="mt-3 text-sm text-[#f0adad]">Native Node workload submission failed. Try again.</p>}
              {artJob.isError && <p role="alert" className="mt-3 text-sm text-[#f0adad]">Native Node workload status could not be loaded.</p>}
              {submission && !nativeExecutionPassed && !artJob.isError && (
                <p className="mt-3 text-xs leading-5 text-[#f6c453]">
                  Native Node execution is {artJob.data?.verificationStatus ?? submission.verificationStatus}; creator acknowledgment is locked.
                </p>
              )}

              {result ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#596252]">CPU-generated name</p>
                    <p className="mt-1 text-2xl font-semibold text-[#efffca]">{result.tokenName}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#596252]">CPU-generated symbol</p>
                    <p className="mt-1 font-mono text-lg text-[#d7ff32]">{result.symbol}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#596252]">CPU-generated description</p>
                    <p className="mt-1 text-sm leading-6 text-[#aab3a2]">{result.description}</p>
                  </div>
                   <button
                     type="button"
                      onClick={() => void approve()}
                       disabled={!nativeExecutionPassed || approved || approveArt.isPending || createApprovalChallenge.isPending}
                     className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0d0e0c] disabled:cursor-not-allowed disabled:border-[#35412c] disabled:bg-[#182014] disabled:text-[#596252]"
                   >
                      <Check size={14} /> {createApprovalChallenge.isPending || approveArt.isPending ? 'Sign creator approval…' : approved ? 'Creator acknowledgment recorded' : 'Sign and acknowledge verified identity'}
                   </button>
                    {approveArt.isError && <p role="alert" className="text-sm text-[#f0adad]">Creator approval failed. Request a new challenge and retry.</p>}
                    <dl className="grid gap-3 border-t border-[#2a3621] pt-4 font-mono text-[10px]">
                       <div><dt className="uppercase tracking-wider text-[#596252]">IPFS readiness</dt><dd className="mt-1 text-[#c7d0bf]">{uploadStatus ?? 'awaiting creator approval'}</dd></div>
                       {ipfsCid && <div><dt className="uppercase tracking-wider text-[#596252]">IPFS CID</dt><dd className="mt-1 break-all text-[#d7ff32]">{ipfsCid}</dd></div>}
                       {logoUri && <div><dt className="uppercase tracking-wider text-[#596252]">Logo URI</dt><dd className="mt-1 break-all text-[#c7d0bf]">{logoUri}</dd></div>}
                    </dl>
                     {approved && uploadStatus !== 'uploaded' && (
                      <button
                        type="button"
                        onClick={upload}
                         disabled={uploadArtifact.isPending || (uploadStatus === 'uploading' && !uploadLeaseExpired)}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-[#35412c] px-4 font-mono text-[10px] uppercase tracking-wider text-[#c7d0bf] hover:border-[#d7ff32] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Upload size={14} /> {uploadArtifact.isPending ? 'Uploading canonical PNG…' : uploadStatus === 'uploading' && !uploadLeaseExpired ? 'Uploading canonical PNG…' : uploadStatus === 'failed' || uploadLeaseExpired ? 'Retry IPFS upload' : 'Upload canonical PNG to IPFS'}
                      </button>
                    )}
                    {uploadArtifact.isError && <p role="alert" className="text-sm text-[#f0adad]">IPFS upload failed. Retry without changing the approved snapshot.</p>}
                     {uploadStatus === 'uploaded' && (
                       <button
                         type="button"
                         onClick={requestDeploymentProof}
                          disabled={deploymentReadiness.data?.ready !== true || issueDeploymentProof.isPending || proofValid}
                          data-testid="button-request-deployment-proof"
                         className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#efffca] hover:bg-[#d7ff32]/10 disabled:cursor-not-allowed disabled:border-[#35412c] disabled:text-[#596252]"
                       >
                         <ShieldCheck size={14} aria-hidden="true" />
                          {issueDeploymentProof.isPending ? 'Verifying mainnet wiring…' : proofValid ? 'Deployment proof issued' : proofExpired ? 'Issue a fresh deployment proof' : 'Request deployment proof'}
                       </button>
                     )}
                     {issueDeploymentProof.isError && <p role="alert" className="text-sm text-[#f0adad]">Deployment proof could not be issued. Confirm the IPFS artifact and server readiness, then retry.</p>}
                      {proof?.status === 'issued' && (
                       <dl className="grid gap-3 border border-[#2a3621] bg-[#0d100b] p-4 font-mono text-[10px]">
                         <div><dt className="uppercase tracking-wider text-[#596252]">Proof digest</dt><dd className="mt-1 break-all text-[#d7ff32]">{proof.digest}</dd></div>
                          <div><dt className="uppercase tracking-wider text-[#596252]">Expires</dt><dd className={`mt-1 ${proofExpired ? 'text-[#f0adad]' : 'text-[#c7d0bf]'}`}>{new Date(Number(proof.expiry) * 1000).toLocaleString()} {proofExpired ? '(expired — fresh proof required)' : ''}</dd></div>
                         <div><dt className="uppercase tracking-wider text-[#596252]">Next action</dt><dd className="mt-1 leading-5 text-[#f6c453]">Creator wallet transactions are required. This page does not auto-submit or hold creator keys.</dd></div>
                       </dl>
                     )}
                      {launchEligible && (
                        <div className="mt-5 border border-[#d7ff32]/50 bg-[#0d100b] p-4" aria-labelledby="creator-launch-heading">
                          <h3 id="creator-launch-heading" className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">Creator wallet mainnet launch</h3>
                          <p className="mt-2 text-xs leading-5 text-[#aab3a2]">
                            These are three irreversible wallet actions. The button below only simulates and then requests each transaction; nothing is broadcast automatically.
                          </p>
                          <ol className="mt-4 space-y-2 border-y border-[#2a3621] py-3 text-xs leading-5 text-[#c7d0bf]">
                            <li><span className="font-mono text-[#d7ff32]">01</span> Registry approval of the exact issued identity proof.</li>
                            <li><span className="font-mono text-[#d7ff32]">02</span> Factory deployment of the token from the Registry digest.</li>
                            <li><span className="font-mono text-[#d7ff32]">03</span> Factory liquidity launch with the selected native value.</li>
                          </ol>
                          <dl className="mt-4 grid gap-2 font-mono text-[10px]">
                            <div><dt className="uppercase tracking-wider text-[#596252]">Registry</dt><dd className="mt-1 break-all text-[#c7d0bf]">{GENESIS_REGISTRY_ADDRESS}</dd></div>
                            <div><dt className="uppercase tracking-wider text-[#596252]">Factory</dt><dd className="mt-1 break-all text-[#c7d0bf]">{GENESIS_FACTORY_ADDRESS}</dd></div>
                            <div><dt className="uppercase tracking-wider text-[#596252]">Coordinator</dt><dd className="mt-1 break-all text-[#c7d0bf]">{GENESIS_COORDINATOR_ADDRESS}</dd></div>
                            <div><dt className="uppercase tracking-wider text-[#596252]">Network</dt><dd className="mt-1 text-[#c7d0bf]">Robinhood Chain · {GENESIS_CHAIN_ID}</dd></div>
                          </dl>
                          <label htmlFor="native-liquidity" className="mt-4 block font-mono text-[10px] uppercase tracking-wider text-[#c7d0bf]">
                            Native liquidity amount
                            <span className="mt-1 block normal-case tracking-normal text-[#687360]">User-editable native value. Canonical rehearsal default: {CANONICAL_LAUNCH_NATIVE} ETH.</span>
                          </label>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              id="native-liquidity"
                              data-testid="input-native-liquidity"
                              inputMode="decimal"
                              value={nativeLiquidity}
                              onChange={(event) => {
                                setNativeLiquidity(event.target.value);
                                setLaunchConfirmed(false);
                              }}
                              disabled={launchStatus !== 'idle' || walletWritePending}
                              className="min-h-11 min-w-0 flex-1 border border-[#46503e] bg-[#090b08] px-3 font-mono text-sm text-[#efffca] outline-none focus:border-[#d7ff32]"
                              aria-describedby="native-liquidity-help"
                            />
                            <span className="font-mono text-xs text-[#88917d]">ETH</span>
                          </div>
                          <p id="native-liquidity-help" className="mt-1 text-[10px] leading-4 text-[#687360]">
                            Excess native value is refunded by the coordinator; the exact value above is sent with launchGenesis.
                          </p>
                          <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#c7d0bf]">
                            <input
                              type="checkbox"
                              data-testid="checkbox-confirm-genesis-launch"
                              checked={launchConfirmed}
                              onChange={(event) => setLaunchConfirmed(event.target.checked)}
                              disabled={launchStatus !== 'idle' || walletWritePending}
                              className="mt-1 h-4 w-4 accent-[#d7ff32]"
                            />
                            <span>I have reviewed the three irreversible steps, contract addresses, and exact native value of <strong className="text-[#efffca]">{nativeLiquidity || 'invalid'} ETH</strong>, and I understand my wallet must approve each transaction.</span>
                          </label>
                          <button
                            type="button"
                            data-testid="button-launch-genesis"
                            onClick={() => void launch()}
                            disabled={!launchConfirmed || !parsedNativeLiquidity || launchStatus !== 'idle' || walletWritePending || reconcileGenesisLaunch.isPending}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#d7ff32] bg-[#d7ff32] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0d0e0c] hover:bg-[#e4ff74] disabled:cursor-not-allowed disabled:border-[#35412c] disabled:bg-[#182014] disabled:text-[#596252]"
                          >
                            {launchStatus ? <LoaderCircle size={14} className="animate-spin" /> : <Wallet size={14} />}
                            {launchStatus || 'Simulate and begin creator launch'}
                          </button>
                          {launchError && <p role="alert" data-testid="status-genesis-launch-error" className="mt-3 text-xs leading-5 text-[#f0adad]">{launchError}</p>}
                          {launchStatus && <p role="status" data-testid="status-genesis-launch-progress" className="mt-3 text-xs leading-5 text-[#d7ff32]">{launchStatus}</p>}
                          {launchSession.approvalTxHash && <a className="mt-3 block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.approvalTxHash)} target="_blank" rel="noreferrer">Registry approval transaction: {launchSession.approvalTxHash}</a>}
                          {launchSession.deploymentTxHash && <a className="mt-2 block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.deploymentTxHash)} target="_blank" rel="noreferrer">Token deployment transaction: {launchSession.deploymentTxHash}</a>}
                          {launchSession.launchTxHash && <a className="mt-2 block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.launchTxHash)} target="_blank" rel="noreferrer">Liquidity launch transaction: {launchSession.launchTxHash}</a>}
                          {launchSession.tokenAddress && (
                            <p className="mt-3 break-all border-t border-[#2a3621] pt-3 font-mono text-xs text-[#efffca]">
                              Final token CA: <a className="text-[#d7ff32] underline" href={launchExplorerUrl('address', launchSession.tokenAddress)} target="_blank" rel="noreferrer">{launchSession.tokenAddress}</a>
                            </p>
                          )}
                          <label className="mt-4 flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-[#88917d]">
                            <input
                              type="checkbox"
                              data-testid="checkbox-reset-launch-recovery"
                              checked={resetLaunchConfirmed}
                              onChange={(event) => setResetLaunchConfirmed(event.target.checked)}
                              disabled={resetLaunchPending || launchStatus !== 'idle'}
                              className="mt-0.5 h-4 w-4 accent-[#d7ff32]"
                            />
                            <span>I understand this clears browser-only recovery hints after re-reading chain state; it cannot undo or alter any chain/backend state.</span>
                          </label>
                          <button
                            type="button"
                            data-testid="button-reset-launch-recovery"
                            onClick={() => void resetLocalLaunchRecovery()}
                            disabled={!resetLaunchConfirmed || resetLaunchPending || launchStatus !== 'idle'}
                            className="mt-2 inline-flex min-h-10 w-full items-center justify-center border border-[#46503e] px-4 font-mono text-[10px] uppercase tracking-wider text-[#88917d] hover:border-[#d7ff32] hover:text-[#efffca] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {resetLaunchPending ? 'Re-reading chain state…' : 'Reset local launch recovery'}
                          </button>
                          {resetLaunchMessage && <p role="status" data-testid="status-reset-launch-recovery" className="mt-2 text-[10px] leading-4 text-[#88917d]">{resetLaunchMessage}</p>}
                        </div>
                      )}
                      {launchComplete && !launchEligible && (
                        <div className="mt-5 border border-[#d7ff32]/50 bg-[#0d100b] p-4" aria-labelledby="completed-launch-heading">
                          <h3 id="completed-launch-heading" className="font-mono text-xs uppercase tracking-widest text-[#d7ff32]">Genesis launch session</h3>
                          <p className="mt-2 text-xs leading-5 text-[#c7d0bf]">This browser has a finalized creator launch session. The issued proof is no longer an active launch control.</p>
                          <p className="mt-3 break-all font-mono text-xs text-[#efffca]">
                            Final token CA: <a className="text-[#d7ff32] underline" href={launchExplorerUrl('address', launchSession.tokenAddress!)} target="_blank" rel="noreferrer">{launchSession.tokenAddress}</a>
                          </p>
                          <div className="mt-3 space-y-2">
                            {launchSession.approvalTxHash && <a className="block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.approvalTxHash)} target="_blank" rel="noreferrer">Registry approval transaction: {launchSession.approvalTxHash}</a>}
                            {launchSession.deploymentTxHash && <a className="block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.deploymentTxHash)} target="_blank" rel="noreferrer">Token deployment transaction: {launchSession.deploymentTxHash}</a>}
                            {launchSession.launchTxHash && <a className="block break-all text-[10px] text-[#d7ff32] underline" href={launchExplorerUrl('tx', launchSession.launchTxHash)} target="_blank" rel="noreferrer">Liquidity launch transaction: {launchSession.launchTxHash}</a>}
                          </div>
                          <label className="mt-4 flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-[#88917d]">
                            <input
                              type="checkbox"
                              data-testid="checkbox-reset-launch-recovery-completed"
                              checked={resetLaunchConfirmed}
                              onChange={(event) => setResetLaunchConfirmed(event.target.checked)}
                              disabled={resetLaunchPending}
                              className="mt-0.5 h-4 w-4 accent-[#d7ff32]"
                            />
                            <span>I understand this clears browser-only recovery hints after re-reading chain state; it cannot alter chain/backend state.</span>
                          </label>
                          <button
                            type="button"
                            data-testid="button-reset-launch-recovery-completed"
                            onClick={() => void resetLocalLaunchRecovery()}
                            disabled={!resetLaunchConfirmed || resetLaunchPending}
                            className="mt-2 inline-flex min-h-10 w-full items-center justify-center border border-[#46503e] px-4 font-mono text-[10px] uppercase tracking-wider text-[#88917d] hover:border-[#d7ff32] hover:text-[#efffca] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {resetLaunchPending ? 'Re-reading chain state…' : 'Reset local launch recovery'}
                          </button>
                          {resetLaunchMessage && <p role="status" data-testid="status-reset-launch-recovery-completed" className="mt-2 text-[10px] leading-4 text-[#88917d]">{resetLaunchMessage}</p>}
                        </div>
                      )}
                   <dl className="grid gap-3 border-t border-[#2a3621] pt-4 font-mono text-[10px]">
                    <div><dt className="uppercase tracking-wider text-[#596252]">Format</dt><dd className="mt-1 text-[#c7d0bf]">{result.width}×{result.height} · {result.colorModel} · {result.bitsPerPixel}-bit</dd></div>
                    <div><dt className="uppercase tracking-wider text-[#596252]">CPU digest</dt><dd className="mt-1 break-all text-[#c7d0bf]">{result.cpuDigest}</dd></div>
                    <div><dt className="uppercase tracking-wider text-[#596252]">Raw image digest</dt><dd className="mt-1 break-all text-[#d7ff32]">{result.imageDigest}</dd></div>
                  </dl>
                </div>
              ) : (
                <div className="mt-5 border border-dashed border-[#35412c] p-6 text-center">
                  <Image size={24} className="mx-auto text-[#46503e]" />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#596252]">Identity not generated</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex min-h-[300px] items-center justify-center border border-[#35412c] bg-black p-3">
                {result
                  ? <PixelPreview pixels={result.pixels} name={result.tokenName} />
                  : <Image size={30} className="text-[#35412c]" aria-hidden="true" />}
              </div>
              <button
                type="button"
                onClick={downloadPng}
                disabled={!result || !approved}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#35412c] font-mono text-[10px] uppercase tracking-wider text-[#c7d0bf] hover:border-[#d7ff32] disabled:cursor-not-allowed disabled:opacity-40"
              >
                 <Download size={14} /> {approved ? 'Export canonical PNG' : 'Approve to export canonical PNG'}
              </button>
              <p className="mt-3 text-xs leading-5 text-[#687360]">
                The PNG is a screen conversion of the raw RGB565 CPU pixels. A later verified stage uploads it to IPFS and places its <code>ipfs://</code> URI in the token&apos;s <code>logo()</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-4 border border-[#2a3621] bg-[#090b08] p-5">
        <LockKeyhole size={20} className="mt-0.5 shrink-0 text-[#596252]" />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#88917d]">
            {proof?.status === 'issued' ? 'Creator transaction required' : 'Token configuration locked'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#687360]">
             {proof?.status === 'issued'
               ? 'The canonical identity is ready, but no token exists yet. The creator must submit the registry approval, deployGenesis, and launchGenesis transactions from the connected wallet.'
               : 'Contract configuration remains locked until the RGB565 workload is executed by the creator’s Native Node, verified by the server, approved and pinned to IPFS, then attested for the deployed registry.'}
          </p>
        </div>
      </div>
    </section>
  );
}