"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./separator";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorAfter?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          tabIndex={-1}
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl py-1.5 text-sm animate-in fade-in zoom-in-95 duration-100 focus:outline-none",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <button
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                  item.danger
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-gray-200 hover:bg-gray-800 hover:text-white"
                )}
              >
                {item.icon && <span className="w-4 h-4 text-gray-400 shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>

              {item.separatorAfter && <Separator className="my-1" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
