export type GridLineStyle = 'solid' | 'dashed' | 'dotted';
export type LabelPosition = 'inside-corner' | 'margin' | 'none';
export type LabelFormat = 'alpha-numeric' | 'numbers' | 'coordinates'; // alpha-numeric: A-Z top, 1-N left; coordinates: A1 in each cell
export type DiagonalMode = 'none' | 'cell' | 'full';

export interface GridSettings {
  columns: number;
  rows: number;
  lockAspectRatio: boolean; // keep 1:1 row/column count or preserve cell squareness
  squareCells: boolean; // compute grid so each cell is a perfect square based on columns
  color: string;
  opacity: number; // 0 to 1
  thickness: number; // in pixels relative to viewport or canvas
  style: GridLineStyle;
  subdivisions: number; // 1 = none, 2 = 2x2 per cell, 3 = 3x3, 4 = 4x4
  subdivisionOpacity: number;
  subdivisionThickness: number;
  subdivisionStyle: GridLineStyle;
  diagonals: DiagonalMode;
  diagonalOpacity: number;
  showCenterLines: boolean;
  centerLineColor: string;
  
  // Labels
  showLabels: boolean;
  labelPosition: LabelPosition;
  labelFormat: LabelFormat;
  labelSize: number; // 10 to 36
  labelColor: string;
  labelBackground: boolean;
}

export interface ImageFilters {
  grayscale: boolean;
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  invert: boolean;
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: number; // 0, 90, 180, 270
}

export interface ImageInfo {
  name: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  sizeBytes?: number;
  type: string;
}

export interface CellFocus {
  col: number; // 0-indexed
  row: number; // 0-indexed
}
