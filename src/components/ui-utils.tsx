import { ArrowRight } from 'lucide-react';

export function SectionLabel({ children, number }: { children: string; number: string }) {
  return (
    <div className="mb-6 flex items-center gap-4 text-[#d7ff32]">
      <span className="font-mono text-xs opacity-60">{number}</span>
      <span className="eyebrow">{children}</span>
      <span className="h-px w-12 bg-[#d7ff32]/40" />
    </div>
  );
}

export function ArrowLink({ children, href = '?page=home#machine' }: { children: string; href?: string }) {
  return (
    <a href={href} className="group inline-flex items-center gap-2 border-b border-[#d7ff32]/45 pb-1 font-mono text-xs uppercase tracking-[.12em] text-[#d7ff32] transition-colors hover:border-[#d7ff32] hover:text-[#edffac]" data-testid={`link-${children.toLowerCase().replace(/\s+/g, '-')}`}>
      {children}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
    </a>
  );
}
