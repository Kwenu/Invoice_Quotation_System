import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontalIcon, BoxIcon } from "lucide-react";
export interface ActionMenuItem {
  label: string;
  icon: BoxIcon;
  onSelect: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}
interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
}
const MENU_WIDTH = 216;
export function ActionMenu({
  items,
  label = 'More actions'
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = items.length * 36 + 12;
      const top = rect.bottom + menuHeight + 8 > window.innerHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
      setPosition({
        top: Math.max(8, top),
        left: Math.max(8, rect.right - MENU_WIDTH)
      });
    }
    setOpen((v) => !v);
  };
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);
  return <>
      <button ref={buttonRef} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={toggle} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40">
        <MoreHorizontalIcon className="h-4 w-4" aria-hidden />
      </button>
      {createPortal(<AnimatePresence>
          {open && <motion.div ref={menuRef} role="menu" initial={{
        opacity: 0,
        scale: 0.96,
        y: -4
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.96
      }} transition={{
        duration: 0.15,
        ease: [0.23, 1, 0.32, 1]
      }} style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: MENU_WIDTH
      }} className="z-50 origin-top-right rounded-xl border border-line bg-white p-1.5 shadow-lg">
              {items.map((item) => <button key={item.label} role="menuitem" type="button" disabled={item.disabled} onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          item.onSelect();
        }} className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${item.tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`}>
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </button>)}
            </motion.div>}
        </AnimatePresence>, document.body)}
    </>;
}