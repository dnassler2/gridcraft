/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CanvasViewport } from './components/CanvasViewport';
import { GridControls } from './components/GridControls';
import { ExportModal } from './components/ExportModal';
import { SampleModal } from './components/SampleModal';
import { PrintModal } from './components/PrintModal';
import { GridSettings, ImageFilters, ImageInfo, CellFocus } from './types';
import { SAMPLE_IMAGES } from './utils/sampleImages';

const DEFAULT_GRID_SETTINGS: GridSettings = {
  columns: 6,
  rows: 6,
  lockAspectRatio: false,
  squareCells: false,
  color: '#ffffff',
  opacity: 0.85,
  thickness: 2,
  style: 'solid',
  subdivisions: 1,
  subdivisionOpacity: 0.5,
  subdivisionThickness: 1,
  subdivisionStyle: 'dashed',
  diagonals: 'none',
  diagonalOpacity: 0.4,
  showCenterLines: false,
  centerLineColor: '#ef4444',
  showLabels: false,
  labelPosition: 'inside-corner',
  labelFormat: 'alpha-numeric',
  labelSize: 14,
  labelColor: '#f59e0b', // amber-400
  labelBackground: true,
};

const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  grayscale: false,
  brightness: 0,
  contrast: 0,
  invert: false,
  flipHorizontal: false,
  flipVertical: false,
  rotation: 0,
};

export default function App() {
  const [gridSettings, setGridSettings] = useState<GridSettings>(DEFAULT_GRID_SETTINGS);
  const [imageFilters, setImageFilters] = useState<ImageFilters>(DEFAULT_IMAGE_FILTERS);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [focusedCell, setFocusedCell] = useState<CellFocus | null>(null);
  const [currentSampleId, setCurrentSampleId] = useState<string | undefined>('classical_portrait');

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load an image from a URL or DataURL
  const loadImageFromSource = useCallback((src: string, name: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setImageInfo({
        name,
        url: src,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspectRatio: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
        type: 'image/png',
      });
      setFocusedCell(null);
    };
    img.src = src;
  }, []);

  // Load default sample study on mount
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    if (initialSample) {
      const dataUrl = initialSample.generate();
      loadImageFromSource(dataUrl, initialSample.title);
    }
  }, [loadImageFromSource]);

  // Handle file uploads
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCurrentSampleId(undefined);
        loadImageFromSource(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle sample selection
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId);
    if (!sample) return;
    setCurrentSampleId(sample.id);
    const dataUrl = sample.generate();
    loadImageFromSource(dataUrl, sample.title);
  };

  // Global clipboard paste listener (Ctrl+V anywhere in app)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.items) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              handleUploadFile(file);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Reset grid settings to default
  const handleResetGrid = () => {
    setGridSettings(DEFAULT_GRID_SETTINGS);
    setFocusedCell(null);
  };

  // Reset image filters to default
  const handleResetFilters = () => {
    setImageFilters(DEFAULT_IMAGE_FILTERS);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadFile(e.target.files[0]);
          }
        }}
      />

      {/* Top Header */}
      <Header
        onOpenSamples={() => setIsSamplesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onResetGrid={handleResetGrid}
        onUploadClick={() => fileInputRef.current?.click()}
        hasImage={!!imageElement}
      />

      {/* Main Workspace (Canvas Viewport + Controls Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <CanvasViewport
          imageInfo={imageInfo}
          imageElement={imageElement}
          gridSettings={gridSettings}
          imageFilters={imageFilters}
          focusedCell={focusedCell}
          setFocusedCell={setFocusedCell}
          onUploadFile={handleUploadFile}
          onSelectSample={handleSelectSample}
          onToggleLabels={() => setGridSettings((prev) => ({ ...prev, showLabels: !prev.showLabels }))}
        />

        <GridControls
          gridSettings={gridSettings}
          setGridSettings={setGridSettings}
          imageFilters={imageFilters}
          setImageFilters={setImageFilters}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Export / Save to Device Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        imageElement={imageElement}
        imageInfo={imageInfo}
        gridSettings={gridSettings}
        imageFilters={imageFilters}
      />

      {/* Sample Studies Selector Modal */}
      <SampleModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={handleSelectSample}
        currentSampleId={currentSampleId}
      />

      {/* Printable Sheet Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        imageElement={imageElement}
        imageInfo={imageInfo}
        gridSettings={gridSettings}
        imageFilters={imageFilters}
      />
    </div>
  );
}
