"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

interface ArrowButtonsProps {
  onUpAction: () => void;
  onDownAction: () => void;
}

export default function ArrowButtons({ onUpAction, onDownAction }: ArrowButtonsProps) {
  return (
    <div className="fixed left-4 bottom-4 flex gap-2">
      <button
        onClick={onUpAction}
        className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        aria-label="Previous video"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <button
        onClick={onDownAction}
        className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        aria-label="Next video"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
}
