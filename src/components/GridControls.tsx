import React, { useState } from 'react';
import {
  Grid,
  Palette,
  Sliders,
  Sparkles,
  Type,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GridSettings, ImageFilters, GridLineStyle, LabelFormat, LabelPosition, DiagonalMode } from '../types';

interface GridControlsProps {
  gridSettings: GridSettings;
  setGridSettings: React.Dispatch<React.SetStateAction<GridSettings>>;
  imageFilters: ImageFilters;
  setImageFilters: React.Dispatch<React.SetStateAction<ImageFilters>>;
  onResetFilters: () => void;
}

const PRESET_GRIDS = [
  { label: '2×2', cols: 2, rows: 2 },
  { label: '3×3 (Thirds)', cols: 3, rows: 3 },
  { label: '4×4', cols: 4, rows: 4 },
  { label: '5×5', cols: 5, rows: 5 },
  { label: '6×6', cols: 6, rows: 6 },
  { label: '8×8', cols: 8, rows: 8 },
  { label: '10×10', cols: 10, rows: 10 },
  { label: '12×12', cols: 12, rows: 12 },
];

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Jet Black', hex: '#000000' },
  { name: 'Vermilion Red', hex: '#ef4444' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Canary Yellow', hex: '#eab308' },
  { name: 'Vibrant Magenta', hex: '#ec4899' },
  { name: 'Neon Green', hex: '#22c55e' },
  { name: 'Silver Slate', hex: '#94a3b8' },
];

export const GridControls: React.FC<GridControlsProps> = ({
  gridSettings,
  setGridSettings,
  imageFilters,
  setImageFilters,
  onResetFilters,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'style' | 'guides' | 'labels' | 'image'>('grid');

  const updateGrid = (updates: Partial<GridSettings>) => {
    setGridSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateFilters = (updates: Partial<ImageFilters>) => {
    setImageFilters((prev) => ({ ...prev, ...updates }));
  };

  const handlePresetClick = (cols: number, rows: number) => {
    setGridSettings((prev) => ({
      ...prev,
      columns: cols,
      rows: rows,
      squareCells: false,
    }));
  };

  return (
    <aside className="w-full lg:w-84 xl:w-92 h-full flex flex-col border-l border-neutral-800 bg-neutral-900/95 backdrop-blur-md overflow-hidden select-none">
      {/* Category Tab Bar (Functional Segmented Control) */}
      <div className="flex items-center p-2 border-b border-neutral-800 bg-neutral-950/60 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'grid'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'style'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Lines</span>
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'guides'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Guides</span>
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'labels'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Labels</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'image'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tonal</span>
        </button>
      </div>

      {/* Tab Panels Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-neutral-300 text-xs">
        {/* ==================== TAB 1: GRID LAYOUT ==================== */}
        {activeTab === 'grid' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2 font-mono">
                Quick Presets
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_GRIDS.map((p) => {
                  const isActive =
                    !gridSettings.squareCells &&
                    gridSettings.columns === p.cols &&
                    gridSettings.rows === p.rows;
                  return (
                    <button
                      key={p.label}
                      onClick={() => handlePresetClick(p.cols, p.rows)}
                      className={`px-2 py-1.5 text-xs font-mono rounded border transition-all text-center ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950/50 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Square Cells Mode Toggle */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-200">Square Cells (1:1)</p>
                <p className="text-[11px] text-neutral-400">
                  Matches physical square grid on drawing paper
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateGrid({ squareCells: !gridSettings.squareCells })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  gridSettings.squareCells ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    gridSettings.squareCells ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Columns Across */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Columns (Across)</span>
                <span className="font-mono tabular-nums text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  {gridSettings.columns}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={gridSettings.columns}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (gridSettings.lockAspectRatio && !gridSettings.squareCells) {
                    updateGrid({ columns: val, rows: val });
                  } else {
                    updateGrid({ columns: val });
                  }
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1 col</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40 cols</span>
              </div>
            </div>

            {/* Rows Down */}
            <div className={`space-y-2 ${gridSettings.squareCells ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-neutral-200">Rows (Down)</span>
                  {gridSettings.squareCells && (
                    <span className="text-[10px] text-neutral-400 italic">(Auto-squared)</span>
                  )}
                </div>
                <span className="font-mono tabular-nums text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  {gridSettings.rows}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                disabled={gridSettings.squareCells}
                value={gridSettings.rows}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (gridSettings.lockAspectRatio) {
                    updateGrid({ columns: val, rows: val });
                  } else {
                    updateGrid({ rows: val });
                  }
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1 row</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40 rows</span>
              </div>
            </div>

            {/* Lock Aspect Ratio (N x N) */}
            {!gridSettings.squareCells && (
              <button
                onClick={() => {
                  const newLocked = !gridSettings.lockAspectRatio;
                  if (newLocked) {
                    updateGrid({ lockAspectRatio: true, rows: gridSettings.columns });
                  } else {
                    updateGrid({ lockAspectRatio: false });
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  gridSettings.lockAspectRatio
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {gridSettings.lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{gridSettings.lockAspectRatio ? 'Locked N × N (Equal Count)' : 'Lock Equal Columns & Rows'}</span>
              </button>
            )}
          </div>
        )}

        {/* ==================== TAB 2: LINE STYLE & COLOR ==================== */}
        {activeTab === 'style' && (
          <div className="space-y-5">
            {/* Color Presets */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2 font-mono">
                Line Color
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {COLOR_PRESETS.map((c) => {
                  const isSelected = gridSettings.color.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => updateGrid({ color: c.hex })}
                      title={c.name}
                      className={`h-8 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/40'
                          : 'border-neutral-700/60 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            c.hex === '#ffffff' || c.hex === '#eab308'
                              ? 'text-neutral-950'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={gridSettings.color}
                  onChange={(e) => updateGrid({ color: e.target.value })}
                  className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={gridSettings.color.toUpperCase()}
                  onChange={(e) => updateGrid({ color: e.target.value })}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 font-mono text-neutral-200 uppercase"
                />
              </div>
            </div>

            {/* Line Thickness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Line Thickness</span>
                <span className="font-mono tabular-nums text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  {gridSettings.thickness} px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={gridSettings.thickness}
                onChange={(e) => updateGrid({ thickness: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1px (Fine)</span>
                <span>4px</span>
                <span>8px (Heavy)</span>
              </div>
            </div>

            {/* Line Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Line Opacity</span>
                <span className="font-mono tabular-nums text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  {Math.round(gridSettings.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={gridSettings.opacity}
                onChange={(e) => updateGrid({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Line Dash Style */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2 font-mono">
                Line Style
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {(['solid', 'dashed', 'dotted'] as GridLineStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateGrid({ style })}
                    className={`py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                      gridSettings.style === style
                        ? 'bg-neutral-800 text-amber-300 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: GUIDES & DIAGONALS ==================== */}
        {activeTab === 'guides' && (
          <div className="space-y-5">
            {/* Subdivisions */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-1 font-mono">
                  Cell Subdivisions
                </label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Divides each main cell into smaller reference sub-grids
                </p>
              </div>

              <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {[
                  { label: 'None', val: 1 },
                  { label: '2 × 2', val: 2 },
                  { label: '3 × 3', val: 3 },
                  { label: '4 × 4', val: 4 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => updateGrid({ subdivisions: item.val })}
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      gridSettings.subdivisions === item.val
                        ? 'bg-neutral-800 text-amber-300 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {gridSettings.subdivisions > 1 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-300">Subdivision Intensity</span>
                    <span className="font-mono text-neutral-400">
                      {Math.round(gridSettings.subdivisionOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={gridSettings.subdivisionOpacity}
                    onChange={(e) => updateGrid({ subdivisionOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Diagonals */}
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-1 font-mono">
                  Diagonal Guidelines
                </label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Pinpoint exact cell centers or global composition diagonals
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                {[
                  { label: 'None', val: 'none' },
                  { label: 'Per Cell (X)', val: 'cell' },
                  { label: 'Full Canvas', val: 'full' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => updateGrid({ diagonals: item.val as DiagonalMode })}
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      gridSettings.diagonals === item.val
                        ? 'bg-neutral-800 text-amber-300 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center Crosshairs */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-medium text-neutral-200">Center Crosshairs</p>
                <p className="text-[11px] text-neutral-400">
                  Highlight horizontal & vertical center axes
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateGrid({ showCenterLines: !gridSettings.showCenterLines })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  gridSettings.showCenterLines ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    gridSettings.showCenterLines ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: LABELS & NUMBERING ==================== */}
        {activeTab === 'labels' && (
          <div className="space-y-5">
            {/* Show Labels Toggle */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-200">Show Grid Labels</p>
                <p className="text-[11px] text-neutral-400">
                  Coordinate reference system (e.g. A1, B2)
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateGrid({ showLabels: !gridSettings.showLabels })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  gridSettings.showLabels ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    gridSettings.showLabels ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {gridSettings.showLabels && (
              <>
                {/* Label Placement */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                    Label Position
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                    <button
                      onClick={() => updateGrid({ labelPosition: 'inside-corner' })}
                      className={`py-1.5 text-xs font-medium rounded transition-colors ${
                        gridSettings.labelPosition === 'inside-corner'
                          ? 'bg-neutral-800 text-amber-300 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Inside Each Cell
                    </button>
                    <button
                      onClick={() => updateGrid({ labelPosition: 'margin' })}
                      className={`py-1.5 text-xs font-medium rounded transition-colors ${
                        gridSettings.labelPosition === 'margin'
                          ? 'bg-neutral-800 text-amber-300 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Top & Left Rulers
                    </button>
                  </div>
                </div>

                {/* Label Format */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                    Label Format
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
                    <button
                      onClick={() => updateGrid({ labelFormat: 'alpha-numeric' })}
                      className={`py-1.5 text-xs font-medium rounded transition-colors ${
                        gridSettings.labelFormat === 'alpha-numeric'
                          ? 'bg-neutral-800 text-amber-300 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      A1, B2 (Letters + Nums)
                    </button>
                    <button
                      onClick={() => updateGrid({ labelFormat: 'numbers' })}
                      className={`py-1.5 text-xs font-medium rounded transition-colors ${
                        gridSettings.labelFormat === 'numbers'
                          ? 'bg-neutral-800 text-amber-300 shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      1,1 / 2,2 (Numbers only)
                    </button>
                  </div>
                </div>

                {/* Label Contrast Background Box */}
                <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-neutral-200">High-Contrast Scrim Box</p>
                    <p className="text-[11px] text-neutral-400">
                      Renders dark backdrop behind labels for legibility
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateGrid({ labelBackground: !gridSettings.labelBackground })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gridSettings.labelBackground ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        gridSettings.labelBackground ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Label Font Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200">Label Size</span>
                    <span className="font-mono tabular-nums text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {gridSettings.labelSize} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="28"
                    value={gridSettings.labelSize}
                    onChange={(e) => updateGrid({ labelSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== TAB 5: TONAL & VALUE ADJUSTMENTS ==================== */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            {/* Grayscale Toggle */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-200">Black & White / Values</p>
                <p className="text-[11px] text-neutral-400">
                  Isolate light and dark values for accurate drawing shading
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateFilters({ grayscale: !imageFilters.grayscale })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  imageFilters.grayscale ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    imageFilters.grayscale ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-medium text-neutral-200">Brightness</span>
                </div>
                <span className="font-mono tabular-nums text-neutral-400">
                  {imageFilters.brightness > 0 ? `+${imageFilters.brightness}` : imageFilters.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={imageFilters.brightness}
                onChange={(e) => updateFilters({ brightness: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-medium text-neutral-200">Contrast</span>
                </div>
                <span className="font-mono tabular-nums text-neutral-400">
                  {imageFilters.contrast > 0 ? `+${imageFilters.contrast}` : imageFilters.contrast}
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={imageFilters.contrast}
                onChange={(e) => updateFilters({ contrast: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Transformations (Mirror, Flip, Rotate) */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono">
                Transformations
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateFilters({ flipHorizontal: !imageFilters.flipHorizontal })}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-center transition-colors cursor-pointer ${
                    imageFilters.flipHorizontal
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800 text-neutral-300'
                  }`}
                  title="Flip horizontally (Artist mirror check)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="text-[11px]">Mirror</span>
                </button>

                <button
                  onClick={() => updateFilters({ flipVertical: !imageFilters.flipVertical })}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-center transition-colors cursor-pointer ${
                    imageFilters.flipVertical
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800 text-neutral-300'
                  }`}
                  title="Flip vertically"
                >
                  <FlipVertical className="w-4 h-4" />
                  <span className="text-[11px]">Flip Y</span>
                </button>

                <button
                  onClick={() =>
                    updateFilters({ rotation: ((imageFilters.rotation + 90) % 360) as any })
                  }
                  className="p-2 rounded-lg border border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800 text-neutral-300 flex flex-col items-center gap-1 text-center transition-colors cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[11px]">Rotate 90°</span>
                </button>
              </div>
            </div>

            {/* Invert Colors */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-200">Invert Colors (Negative)</p>
                <p className="text-[11px] text-neutral-400">
                  Ideal for white charcoal on black paper drawing
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateFilters({ invert: !imageFilters.invert })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  imageFilters.invert ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    imageFilters.invert ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reset Filters button */}
            <button
              onClick={onResetFilters}
              className="w-full py-2 px-3 rounded-lg border border-neutral-800 bg-neutral-950/40 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
            >
              Reset Image Adjustments
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
