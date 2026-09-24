import React from 'react';
import { Download, Image as ImageIcon, RotateCcw, Printer, Grid } from 'lucide-react';

interface HeaderProps {
  onOpenSamples: () => void;
  onOpenExport: () => void;
  onOpenPrint: () => void;
  onResetGrid: () => void;
  onUploadClick: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSamples,
  onOpenExport,
  onOpenPrint,
  onResetGrid,
  onUploadClick,
  hasImage,
}) => {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Grid className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-neutral-100 flex items-center gap-2">
            GridCraft
            <span className="text-xs font-normal text-amber-400/90 tracking-normal border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Drawing Reference
            </span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick utilities */}
      <nav className="hidden lg:flex items-center gap-2 text-xs font-medium text-neutral-400">
        <button
          onClick={onOpenSamples}
          className="px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          title="Browse classical reference studies"
        >
          Sample Studies
        </button>

        <button
          onClick={onOpenPrint}
          disabled={!hasImage}
          className="px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-neutral-200 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
          title="Print reference with matching blank paper grid"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Blank Grid</span>
        </button>

        <button
          onClick={onResetGrid}
          className="px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-neutral-200 transition-colors flex items-center gap-1.5"
          title="Reset grid lines to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Grid</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUploadClick}
          className="px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg border border-neutral-700/80 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          title="Upload reference photo from computer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Image</span>
        </button>

        <button
          onClick={onOpenExport}
          disabled={!hasImage}
          className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save Image</span>
        </button>
      </div>
    </header>
  );
};
