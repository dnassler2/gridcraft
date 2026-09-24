import React, { useRef, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { GridSettings, ImageFilters, ImageInfo } from '../types';
import { generateMatchingBlankGrid, calculateEffectiveGrid, renderImageWithGrid } from '../utils/canvasRenderer';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageElement: HTMLImageElement | null;
  imageInfo: ImageInfo | null;
  gridSettings: GridSettings;
  imageFilters: ImageFilters;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  imageElement,
  imageInfo,
  gridSettings,
  imageFilters,
}) => {
  const [printMode, setPrintMode] = useState<'both' | 'blank-only' | 'ref-only'>('both');

  if (!isOpen || !imageElement) return null;

  const isRotated = imageFilters.rotation === 90 || imageFilters.rotation === 270;
  const baseW = isRotated ? imageElement.height : imageElement.width;
  const baseH = isRotated ? imageElement.width : imageElement.height;
  const { columns, rows } = calculateEffectiveGrid(baseW, baseH, gridSettings);

  const blankGridUrl = generateMatchingBlankGrid({
    width: 1600,
    height: Math.round((1600 / baseW) * baseH),
    columns,
    rows,
    subdivisions: gridSettings.subdivisions,
  });

  const handlePrint = () => {
    // Open a clean print window with styling
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate reference image data URL
    const refCanvas = document.createElement('canvas');
    refCanvas.width = 1600;
    refCanvas.height = Math.round((1600 / baseW) * baseH);
    renderImageWithGrid({
      canvas: refCanvas,
      image: imageElement,
      grid: gridSettings,
      filters: imageFilters,
      scale: 1600 / baseW,
      showOverlays: true,
      includeMarginRuler: true,
    });
    const refDataUrl = refCanvas.toDataURL('image/png');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Drawing Grid Reference - ${columns}x${rows}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; color: #111; }
            .header { margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
            .header h1 { font-size: 18px; margin: 0 0 4px 0; }
            .header p { font-size: 12px; color: #666; margin: 0; }
            .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .page:last-child { page-break-after: avoid; }
            img { max-width: 100%; max-height: 85vh; object-contain; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          ${
            printMode !== 'blank-only'
              ? `
            <div class="page">
              <div class="header" style="width: 100%;">
                <h1>Reference Image with Grid Overlay (${columns} × ${rows})</h1>
                <p>GridCraft Artist Drawing Sheet · Source: ${imageInfo?.name || 'Reference'}</p>
              </div>
              <img src="${refDataUrl}" />
            </div>
          `
              : ''
          }
          ${
            printMode !== 'ref-only'
              ? `
            <div class="page">
              <div class="header" style="width: 100%;">
                <h1>Matching Blank Paper Grid (${columns} × ${rows})</h1>
                <p>Printable Transfer Grid for Sketchbook / Watercolor Paper</p>
              </div>
              <img src="${blankGridUrl}" />
            </div>
          `
              : ''
          }
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100 tracking-tight">
                Print Drawing Reference Sheet
              </h3>
              <p className="text-xs text-neutral-400">
                Print reference image alongside a blank matching paper transfer grid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-neutral-300 text-xs">
          <div>
            <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2 font-mono">
              Print Selection
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
              <button
                onClick={() => setPrintMode('both')}
                className={`py-2 px-3 text-xs font-medium rounded transition-colors ${
                  printMode === 'both'
                    ? 'bg-neutral-800 text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Both Sheets (2 Pages)
              </button>
              <button
                onClick={() => setPrintMode('blank-only')}
                className={`py-2 px-3 text-xs font-medium rounded transition-colors ${
                  printMode === 'blank-only'
                    ? 'bg-neutral-800 text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Blank Grid Only
              </button>
              <button
                onClick={() => setPrintMode('ref-only')}
                className={`py-2 px-3 text-xs font-medium rounded transition-colors ${
                  printMode === 'ref-only'
                    ? 'bg-neutral-800 text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Reference Only
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-400">Grid Dimensions:</span>
              <span className="text-amber-300 font-semibold">{columns} columns × {rows} rows</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-neutral-400">Subdivisions:</span>
              <span className="text-neutral-200">
                {gridSettings.subdivisions > 1 ? `${gridSettings.subdivisions}×${gridSettings.subdivisions} per cell` : 'None'}
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-neutral-400">Paper Aspect Ratio:</span>
              <span className="text-neutral-200">{(baseW / baseH).toFixed(2)}:1</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Printing the matching blank grid onto paper or watercolor sheets gives you identical square cells and coordinate headers so you can transfer your drawing with total anatomical and spatial precision.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold flex items-center gap-2 shadow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open Print Dialog</span>
          </button>
        </div>
      </div>
    </div>
  );
};
