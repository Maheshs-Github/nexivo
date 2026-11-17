import { Dialog } from "radix-ui";
import { ArrowRight, X } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { ActionLink, SmartLink } from "@/components/ui/action-link";

/** Full-height mobile drawer (Radix Dialog: focus trap, Esc to close, scroll lock). Lazy-loaded on first open. */
export default function MobileMenu({ open, onOpenChange, items, cta }: {
  open: boolean; onOpenChange: (o: boolean) => void; items: NavItem[]; cta: { label: string; href: string } | null;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-bg/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-sm flex-col border-l border-line bg-bg px-6 pb-8 pt-4 shadow-float data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right">
          <div className="flex h-12 items-center justify-between">
            <Dialog.Title className="font-display text-base font-semibold">Menu</Dialog.Title>
            <Dialog.Close className="grid size-10 place-items-center rounded-full hover:bg-surface-2" aria-label="Close menu">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <ul className="mt-6 flex flex-col">
            {items.map((item, i) => (
              <li key={item.id} className="border-b border-line">
                <SmartLink href={item.url} className="group flex items-center justify-between py-4 font-display text-2xl font-semibold tracking-tight">
                  <span><span className="mr-3 font-mono text-xs text-text-muted">{String(i + 1).padStart(2, "0")}</span>{item.label}</span>
                  <ArrowRight className="size-5 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-text" aria-hidden />
                </SmartLink>
              </li>
            ))}
          </ul>
          {cta && <ActionLink href={cta.href} className="mt-auto w-full" size="lg" arrow>{cta.label}</ActionLink>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
