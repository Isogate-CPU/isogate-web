import { useEffect, useState } from 'react';
import { useGetJobReceipt, getGetJobReceiptQueryKey } from '@api-client';
import { Search, FileText, Download, AlertCircle, Activity, ShieldCheck } from 'lucide-react';

export function ProofReceiptPage() {
  const [searchInput, setSearchInput] = useState(() => new URLSearchParams(window.location.search).get('jobId')?.trim() ?? '');
  const [jobId, setJobId] = useState(() => new URLSearchParams(window.location.search).get('jobId')?.trim() ?? '');

  useEffect(() => {
    const queryJobId = new URLSearchParams(window.location.search).get('jobId')?.trim() ?? '';
    if (queryJobId) {
      setSearchInput(queryJobId);
      setJobId(queryJobId);
    }
  }, []);

  const { data: receipt, isLoading, isError } = useGetJobReceipt(jobId, { query: { enabled: !!jobId, queryKey: getGetJobReceiptQueryKey(jobId) } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setJobId(searchInput.trim());
    }
  };

  const handleDownload = () => {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.jobId.substring(0,8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-shell flex-1 py-12 lg:py-20">
      <header className="mb-10 flex flex-col gap-5 border-b border-[#2a3621] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f3e8] lg:text-5xl">Verification Receipt</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-[#88917d]">Verification receipt lookup</p>
        </div>
        <span className="border border-[#d7ff32]/35 bg-[#d7ff32]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#d7ff32]">
          Live beta
        </span>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#596252]" size={18} />
            <input 
              type="text" 
              placeholder="Enter Job ID to look up receipt..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-14 bg-[#11150e] border border-[#2a3621] text-[#efffca] font-mono text-sm pl-12 pr-4 outline-none focus:border-[#d7ff32] focus:ring-1 focus:ring-[#d7ff32] transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={!searchInput.trim() || isLoading}
            className="h-14 px-8 bg-[#d7ff32] text-[#0d0e0c] font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#e4ff74] disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? <Activity className="animate-spin" size={18} /> : 'Lookup'}
          </button>
        </form>

        {isError && (
          <div className="border border-red-500/30 bg-red-500/10 p-5 flex items-center gap-3 text-red-400 font-mono text-xs uppercase tracking-widest">
            <AlertCircle size={18} /> Receipt not found or job incomplete
          </div>
        )}

        {receipt && (
          <div className="border border-[#2a3621] bg-[#090b08] shadow-2xl">
            <div className="p-5 border-b border-[#2a3621] bg-[#11150e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#d7ff32]" />
                <h2 className="font-mono text-sm uppercase tracking-widest text-[#d7ff32]">Verification Receipt</h2>
              </div>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 border border-[#35412c] text-[#88917d] hover:text-[#d7ff32] hover:border-[#d7ff32] transition-colors font-mono text-[10px] uppercase tracking-widest"
              >
                <Download size={14} /> Download JSON
              </button>
            </div>
            
            <div className="p-6 lg:p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-1">RECEIPT ID</div>
                  <div className="font-mono text-xs text-[#efffca] break-all">{receipt.receiptId}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-1">JOB ID</div>
                  <div className="font-mono text-xs text-[#efffca] break-all">{receipt.jobId}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-1">VERIFICATION METHOD</div>
                  <div className="font-mono text-xs text-[#efffca]">{receipt.verificationMethod}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-1">STATUS</div>
                  <div className="inline-block px-2 py-1 bg-[#d7ff32]/10 text-[#d7ff32] font-mono text-[10px] font-bold uppercase tracking-widest border border-[#d7ff32]/30 w-fit">
                    {receipt.verificationStatus}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2a3621] pt-6">
                <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-3 flex items-center gap-2">
                  <FileText size={12} /> Execution Result Digest ({receipt.digestAlgorithm})
                </div>
                <div className="bg-[#11150e] border border-[#35412c] p-4 font-mono text-xs text-[#d7ff32] break-all leading-relaxed">
                  {receipt.resultDigest}
                </div>
                <p className="mt-3 text-xs text-[#687360] leading-relaxed">
                  This receipt records that the Isogate backend independently recomputed the job and accepted the matching Native Node output digest.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-[#2a3621] pt-6">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-2">COMPLETED AT (UTC)</div>
                  <div className="font-mono text-xs text-[#88917d]">{new Date(receipt.completedAt).toISOString().replace('T', ' ').substring(0, 19)}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#596252] mb-2">ENGINE</div>
                  <div className="font-mono text-xs text-[#88917d]">{receipt.engine}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
