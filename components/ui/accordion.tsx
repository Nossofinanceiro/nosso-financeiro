"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = React.useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((i) => i !== id));
    } else {
      setExpanded(allowMultiple ? [...expanded, id] : [id]);
    }
  };

  return (
    <div className={cn("divide-y divide-gray-800/80 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden", className)}>
      {items.map((item) => {
        const isOpen = expanded.includes(item.id);
        return (
          <div key={item.id} className="transition-colors">
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => !item.disabled && toggleItem(item.id)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center justify-between p-4 text-left font-medium text-sm text-gray-200 hover:text-white hover:bg-gray-800/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                isOpen && "bg-gray-800/30 text-emerald-400"
              )}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform duration-200",
                  isOpen && "rotate-180 text-emerald-400"
                )}
              />
            </button>

            {isOpen && (
              <div className="p-4 pt-1 text-sm text-gray-300 border-t border-gray-800/40 animate-in fade-in duration-150">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
