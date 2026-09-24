import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Upload,
  Layers,
  Crosshair,
  Info,
  Check,
  Eye,
  EyeOff,
  Type,
} from 'lucide-react';
import { GridSettings, ImageFilters, ImageInfo, CellFocus } from '../types';
import { renderImageWithGrid, calculateEffectiveGrid, getCellCoordinate } from '../utils/canvasRenderer';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface CanvasViewportProps {
  imageInfo: ImageInfo | null;
  imageElement: HTMLImageElement | null;
  gridSettings: GridSettings;
  imageFilters: ImageFilters;
  focusedCell: CellFocus | null;
  setFocusedCell: React.Dispatch<React.SetStateAction<CellFocus | null>>;
  onUploadFile: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  onToggleLabels?: () => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  imageInfo,
  imageElement,
  gridSettings,
  imageFilters,
  focusedCell,
  setFocusedCell,
  onUploadFile,
  onSelectSample,
  onToggleLabels,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [hideGridOverlay, setHideGridOverlay] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number } | null>(null);

  // Auto-fit image to container on initial load
  const fitToContainer = useCallback(() => {
    if (!containerRef.current || !imageElement) return;
    const containerW = containerRef.current.clientWidth - 48;
    const containerH = containerRef.current.clientHeight - 48;
    if (containerW <= 0 || containerH <= 0) return;

    const isRotated = imageFilters.rotation === 90 || imageFilters.rotation === 270;
    const imgW = isRotated ? imageElement.height : imageElement.width;
    const imgH = isRotated ? imageElement.width : imageElement.height;

    const scaleW = containerW / imgW;
    const scaleH = containerH / imgH;
    const fitScale = Math.min(scaleW, scaleH, 1);

    setZoom(fitScale);
    setPan({ x: 0, y: 0 });
  }, [imageElement, imageFilters.rotation]);

  useEffect(() => {
    fitToContainer();
  }, [fitToContainer]);

  // Re-render canvas whenever relevant settings change
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;

    renderImageWithGrid({
      canvas: canvasRef.current,
      image: imageElement,
      grid: gridSettings,
      filters: imageFilters,
      focusedCell: focusedCell,
      scale: 1, // Full 1:1 native canvas resolution
      showOverlays: !hideGridOverlay,
      includeMarginRuler: gridSettings.showLabels && gridSettings.labelPosition === 'margin',
    });
  }, [imageElement, gridSettings, imageFilters, focusedCell, hideGridOverlay]);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * zoomFactor)));
  };

  // Drag and pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click or middle click
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Compute hovered cell coordinate for tooltip
    if (!canvasRef.current || !imageElement) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX >= 0 && clientX <= rect.width && clientY >= 0 && clientY <= rect.height) {
      const isRotated = imageFilters.rotation === 90 || imageFilters.rotation === 270;
      const baseW = isRotated ? imageElement.height : imageElement.width;
      const baseH = isRotated ? imageElement.width : imageElement.height;
      const { columns, rows } = calculateEffectiveGrid(baseW, baseH, gridSettings);

      const cellW = rect.width / columns;
      const cellH = rect.height / rows;
      const col = Math.floor(clientX / cellW);
      const row = Math.floor(clientY / cellH);

      if (col >= 0 && col < columns && row >= 0 && row < rows) {
        setHoveredCell({ col, row });
        return;
      }
    }
    setHoveredCell(null);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      // Check if this was a click rather than a substantial drag
      const movedDist = Math.hypot(e.clientX - (dragStart.x + pan.x), e.clientY - (dragStart.y + pan.y));
      setIsDragging(false);

      if (movedDist < 5 && hoveredCell) {
        // Toggle cell focus
        if (focusedCell?.col === hoveredCell.col && focusedCell?.row === hoveredCell.row) {
          setFocusedCell(null);
        } else {
          setFocusedCell({ col: hoveredCell.col, row: hoveredCell.row });
        }
      }
    }
  };

  // Drag and drop image files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUploadFile(file);
      }
    }
  };

  // Calculations for information footer
  const isRotated = imageFilters.rotation === 90 || imageFilters.rotation === 270;
  const currentW = imageElement ? (isRotated ? imageElement.height : imageElement.width) : 0;
  const currentH = imageElement ? (isRotated ? imageElement.width : imageElement.height) : 0;
  const effectiveGrid = imageElement
    ? calculateEffectiveGrid(currentW, currentH, gridSettings)
    : { columns: gridSettings.columns, rows: gridSettings.rows, cellWidth: 0, cellHeight: 0 };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 h-full overflow-hidden bg-neutral-950 flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${
        isDragOver ? 'ring-2 ring-amber-400 bg-neutral-900/50' : ''
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Empty State / Upload Banner when no image is loaded */}
      {!imageElement && (
        <div className="max-w-xl mx-auto p-8 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/80 backdrop-blur-md text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-100 tracking-tight mb-2">
            Upload Image for Grid Overlay
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
            Drag and drop any drawing photo, sketch, or portrait here. Or paste directly from your clipboard (<kbd className="px-1.5 py-0.5 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-300">Ctrl+V</kbd>).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <label className="px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose File from Device</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUploadFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <div className="pt-6 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wider font-mono">
              Or try a classical reference study:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950/60 hover:border-amber-500/50 hover:bg-neutral-800/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-medium text-neutral-200 group-hover:text-amber-300 truncate">
                    {sample.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">{sample.category}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas with Transform Pan & Zoom */}
      {imageElement && (
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 100ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative inline-block shadow-2xl rounded-sm overflow-hidden"
        >
          <canvas ref={canvasRef} className="block max-w-none" />
        </div>
      )}

      {/* Floating Viewport Controls (Top Right) */}
      {imageElement && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-lg shadow-xl z-20">
          <label
            className="p-1.5 rounded hover:bg-neutral-800 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 text-xs px-2"
            title="Upload new image from your device"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadFile(e.target.files[0]);
                }
              }}
            />
          </label>
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
          <button
            onClick={() => setZoom((prev) => Math.min(5, prev * 1.25))}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Zoom In (Scroll up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(0.1, prev * 0.8))}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Zoom Out (Scroll down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
          <button
            onClick={fitToContainer}
            className="px-2 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors flex items-center gap-1"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="100% Native Resolution"
          >
            1:1
          </button>
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
          <button
            onClick={() => setHideGridOverlay((prev) => !prev)}
            className={`p-1.5 rounded transition-colors ${
              hideGridOverlay
                ? 'bg-amber-500/20 text-amber-300'
                : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title={hideGridOverlay ? 'Show Grid Lines' : 'Hide Grid Lines (Peek Original Photo)'}
          >
            {hideGridOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {onToggleLabels && (
            <button
              onClick={onToggleLabels}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs px-2 ${
                gridSettings.showLabels
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title={gridSettings.showLabels ? 'Hide Cell Labels' : 'Show Cell Labels (A1, B2)'}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{gridSettings.showLabels ? 'Labels On' : 'Labels Off'}</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Active Cell Focus Indicator (Top Left) */}
      {imageElement && focusedCell && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-lg shadow-lg text-xs text-amber-300 z-20">
          <Crosshair className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-mono font-medium">
            Focus: Cell {getCellCoordinate(focusedCell.col, focusedCell.row, gridSettings.labelFormat)}
          </span>
          <span className="text-amber-400/60">·</span>
          <span className="text-neutral-300 font-mono">
            {Math.round(effectiveGrid.cellWidth)} × {Math.round(effectiveGrid.cellHeight)} px
          </span>
          <button
            onClick={() => setFocusedCell(null)}
            className="ml-1 text-[11px] underline text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Bottom Information & Metadata Bar */}
      {imageElement && (
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-neutral-400 pointer-events-none z-20">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 backdrop-blur-md pointer-events-auto">
            <span className="text-neutral-200 font-medium truncate max-w-[140px] sm:max-w-xs">
              {imageInfo?.name || 'Reference Image'}
            </span>
            <span className="text-neutral-600">/</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {currentW} × {currentH} px
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300 font-mono">
              {effectiveGrid.columns} × {effectiveGrid.rows} Grid
            </span>
            <span className="hidden sm:inline text-neutral-600">/</span>
            <span className="hidden sm:inline text-neutral-400 font-mono">
              Cell: {Math.round(effectiveGrid.cellWidth)} × {Math.round(effectiveGrid.cellHeight)} px
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 backdrop-blur-md pointer-events-auto font-mono tabular-nums text-neutral-300">
            <span>{Math.round(zoom * 100)}%</span>
            {hoveredCell && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-amber-400">
                  {getCellCoordinate(hoveredCell.col, hoveredCell.row, gridSettings.labelFormat)}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
