import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, FileImage, Printer, Eye } from 'lucide-react';
import { GridSettings, ImageFilters, ImageInfo } from '../types';
import { renderImageWithGrid, generateMatchingBlankGrid, calculateEffectiveGrid } from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageElement: HTMLImageElement | null;
  imageInfo: ImageInfo | null;
  gridSettings: GridSettings;
  imageFilters: ImageFilters;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageElement,
  imageInfo,
  gridSettings,
  imageFilters,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(1);
  const [includeLabels, setIncludeLabels] = useState<boolean>(gridSettings.showLabels);
  const [includeFilters, setIncludeFilters] = useState<boolean>(true);
  const [includeMarginRuler, setIncludeMarginRuler] = useState<boolean>(
    gridSettings.showLabels && gridSettings.labelPosition === 'margin'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final dimensions
  const isRotated = imageFilters.rotation === 90 || imageFilters.rotation === 270;
  const baseW = imageElement ? (isRotated ? imageElement.height : imageElement.width) : 0;
  const baseH = imageElement ? (isRotated ? imageElement.width : imageElement.height) : 0;

  const rulerOffset = includeMarginRuler && includeLabels ? Math.max(28, Math.round(baseW * 0.04)) : 0;
  const exportW = Math.round((baseW + rulerOffset) * scale);
  const exportH = Math.round((baseH + rulerOffset) * scale);

  // Render preview canvas
  useEffect(() => {
    if (!isOpen || !imageElement || !previewCanvasRef.current) return;

    const previewGrid: GridSettings = {
      ...gridSettings,
      showLabels: includeLabels,
    };

    const previewFilters: ImageFilters = includeFilters
      ? imageFilters
      : {
          grayscale: false,
          brightness: 0,
          contrast: 0,
          invert: false,
          flipHorizontal: imageFilters.flipHorizontal,
          flipVertical: imageFilters.flipVertical,
          rotation: imageFilters.rotation,
        };

    renderImageWithGrid({
      canvas: previewCanvasRef.current,
      image: imageElement,
      grid: previewGrid,
      filters: previewFilters,
      scale: 1, // Preview scale
      showOverlays: true,
      includeMarginRuler: includeMarginRuler && includeLabels,
    });
  }, [isOpen, imageElement, gridSettings, imageFilters, includeLabels, includeFilters, includeMarginRuler]);

  if (!isOpen || !imageElement) return null;

  // Build the exported canvas
  const createExportCanvas = (): HTMLCanvasElement => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;

    const exportGrid: GridSettings = {
      ...gridSettings,
      showLabels: includeLabels,
    };

    const exportFilters: ImageFilters = includeFilters
      ? imageFilters
      : {
          grayscale: false,
          brightness: 0,
          contrast: 0,
          invert: false,
          flipHorizontal: imageFilters.flipHorizontal,
          flipVertical: imageFilters.flipVertical,
          rotation: imageFilters.rotation,
        };

    renderImageWithGrid({
      canvas: exportCanvas,
      image: imageElement,
      grid: exportGrid,
      filters: exportFilters,
      scale: scale,
      showOverlays: true,
      includeMarginRuler: includeMarginRuler && includeLabels,
    });

    return exportCanvas;
  };

  const handleDownload = () => {
    setIsExporting(true);
    try {
      const canvas = createExportCanvas();
      const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
      const baseName = (imageInfo?.name || 'drawing_reference').replace(/\.[^/.]+$/, '');
      const { columns, rows } = calculateEffectiveGrid(baseW, baseH, gridSettings);
      const filename = `${baseName}_grid_${columns}x${rows}.${ext}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);
        },
        format,
        quality
      );
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const canvas = createExportCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          console.warn('ClipboardItem copy error:', e);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  const handleDownloadBlankGrid = () => {
    const { columns, rows } = calculateEffectiveGrid(baseW, baseH, gridSettings);
    const dataUrl = generateMatchingBlankGrid({
      width: 2400,
      height: Math.round((2400 / baseW) * baseH),
      columns,
      rows,
      subdivisions: gridSettings.subdivisions,
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `blank_drawing_grid_${columns}x${rows}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100 tracking-tight">
                Save Reference Image
              </h3>
              <p className="text-xs text-neutral-400">
                Exports at high resolution with your custom grid superimposed
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Live Preview */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
              Export Preview
            </span>
            <div className="flex-1 min-h-[240px] max-h-[340px] rounded-xl border border-neutral-800 bg-neutral-950 flex items-center justify-center p-2 overflow-hidden shadow-inner">
              <canvas
                ref={previewCanvasRef}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>Resolution: {exportW} × {exportH} px</span>
              <span>Scale: {scale}×</span>
            </div>
          </div>

          {/* Right Column: Settings & Actions */}
          <div className="space-y-4 text-xs text-neutral-300">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-1.5 font-mono">
                Image Format
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {[
                  { id: 'image/png', label: 'PNG (Sharp)' },
                  { id: 'image/jpeg', label: 'JPEG (Photo)' },
                  { id: 'image/webp', label: 'WebP' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      format === item.id
                        ? 'bg-neutral-800 text-amber-300 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider for JPEG */}
            {format === 'image/jpeg' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">JPEG Quality</span>
                  <span className="font-mono text-amber-400">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            )}

            {/* Output Scale Multiplier */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-1.5 font-mono">
                Output Resolution
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {[
                  { s: 0.5, label: '0.5× (Compact)' },
                  { s: 1, label: '1× (Original)' },
                  { s: 2, label: '2× (High-Res)' },
                ].map((item) => (
                  <button
                    key={item.s}
                    onClick={() => setScale(item.s)}
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      scale === item.s
                        ? 'bg-neutral-800 text-amber-300 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLabels}
                  onChange={(e) => setIncludeLabels(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-400 focus:ring-0 bg-neutral-800 border-neutral-700"
                />
                <div>
                  <p className="text-xs font-medium text-neutral-200">Include Grid Coordinates / Labels</p>
                  <p className="text-[10px] text-neutral-500">Prints A1, B2 row/column markers on image</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFilters}
                  onChange={(e) => setIncludeFilters(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-400 focus:ring-0 bg-neutral-800 border-neutral-700"
                />
                <div>
                  <p className="text-xs font-medium text-neutral-200">Apply Tonal Filters (B&W / Contrast)</p>
                  <p className="text-[10px] text-neutral-500">Uncheck to export original color image with grid</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMarginRuler}
                  onChange={(e) => setIncludeMarginRuler(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-400 focus:ring-0 bg-neutral-800 border-neutral-700"
                />
                <div>
                  <p className="text-xs font-medium text-neutral-200">Outer Margin Ruler</p>
                  <p className="text-[10px] text-neutral-500">Adds numbered ruler margin along outside edges</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/80">
          <button
            onClick={handleDownloadBlankGrid}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Download matching blank grid for your drawing paper"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-400" />
            <span>Download Blank Paper Grid</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied PNG!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Save to Device'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
