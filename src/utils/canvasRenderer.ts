import { GridSettings, ImageFilters, DiagonalMode, LabelFormat, LabelPosition } from '../types';

export function getColumnLabel(index: number, format: LabelFormat): string {
  if (format === 'numbers') {
    return String(index + 1);
  }
  // Alpha (A, B, C ... Z, AA, AB ...)
  let label = '';
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}

export function getRowLabel(index: number): string {
  return String(index + 1);
}

export function getCellCoordinate(col: number, row: number, format: LabelFormat): string {
  if (format === 'numbers') {
    return `${col + 1},${row + 1}`;
  }
  return `${getColumnLabel(col, format)}${getRowLabel(row)}`;
}

/**
 * Calculates effective grid columns and rows considering squareCells setting
 */
export function calculateEffectiveGrid(
  width: number,
  height: number,
  settings: GridSettings
): { columns: number; rows: number; cellWidth: number; cellHeight: number } {
  const columns = Math.max(1, Math.min(60, settings.columns));
  let rows = Math.max(1, Math.min(60, settings.rows));

  if (settings.squareCells) {
    const squareSize = width / columns;
    rows = Math.max(1, Math.round(height / squareSize));
    return {
      columns,
      rows,
      cellWidth: width / columns,
      cellHeight: height / rows,
    };
  }

  return {
    columns,
    rows,
    cellWidth: width / columns,
    cellHeight: height / rows,
  };
}

/**
 * Builds CSS filter string from ImageFilters
 */
export function buildFilterString(filters: ImageFilters): string {
  const parts: string[] = [];
  if (filters.grayscale) parts.push('grayscale(100%)');
  if (filters.brightness !== 0) {
    const val = 100 + filters.brightness;
    parts.push(`brightness(${Math.max(0, val)}%)`);
  }
  if (filters.contrast !== 0) {
    const val = 100 + filters.contrast;
    parts.push(`contrast(${Math.max(0, val)}%)`);
  }
  if (filters.invert) parts.push('invert(100%)');
  return parts.length > 0 ? parts.join(' ') : 'none';
}

interface RenderOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  grid: GridSettings;
  filters: ImageFilters;
  focusedCell?: { col: number; row: number } | null;
  scale?: number; // scale multiplier for high-res export
  showOverlays?: boolean; // if false, renders only filtered image
  includeMarginRuler?: boolean; // if true, draws outer border ruler
}

/**
 * Main drawing function that renders image + grid onto any canvas
 */
export function renderImageWithGrid({
  canvas,
  image,
  grid,
  filters,
  focusedCell = null,
  scale = 1,
  showOverlays = true,
  includeMarginRuler = false,
}: RenderOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Handle rotation orientation (90 / 270 deg swaps width & height)
  const isRotated90or270 = filters.rotation === 90 || filters.rotation === 270;
  const baseWidth = isRotated90or270 ? image.height : image.width;
  const baseHeight = isRotated90or270 ? image.width : image.height;

  // Optional extra margin for external ruler labels
  const rulerMargin = includeMarginRuler && grid.showLabels && grid.labelPosition === 'margin'
    ? Math.max(28 * scale, Math.round(baseWidth * 0.04))
    : 0;

  const totalWidth = Math.round((baseWidth + rulerMargin) * scale);
  const totalHeight = Math.round((baseHeight + rulerMargin) * scale);

  if (canvas.width !== totalWidth || canvas.height !== totalHeight) {
    canvas.width = totalWidth;
    canvas.height = totalHeight;
  }

  ctx.clearRect(0, 0, totalWidth, totalHeight);

  // If there's an outer ruler margin, fill ruler background
  if (rulerMargin > 0) {
    ctx.fillStyle = '#18181b'; // neutral-900
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }

  const renderX = rulerMargin;
  const renderY = rulerMargin;
  const renderWidth = Math.round(baseWidth * scale);
  const renderHeight = Math.round(baseHeight * scale);

  // 1. Draw Image with orientation, flips, and filters
  ctx.save();
  ctx.translate(renderX + renderWidth / 2, renderY + renderHeight / 2);

  // Rotation
  if (filters.rotation !== 0) {
    ctx.rotate((filters.rotation * Math.PI) / 180);
  }

  // Flips
  const scaleX = filters.flipHorizontal ? -1 : 1;
  const scaleY = filters.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Filters
  ctx.filter = buildFilterString(filters);

  // Draw source image centered
  const drawW = Math.round(image.width * scale);
  const drawH = Math.round(image.height * scale);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  if (!showOverlays) return;

  // 2. Compute Grid Dimensions
  const { columns, rows, cellWidth, cellHeight } = calculateEffectiveGrid(
    renderWidth,
    renderHeight,
    grid
  );

  // 3. Focused Cell Highlight / Scrim
  if (focusedCell) {
    const fX = renderX + focusedCell.col * cellWidth;
    const fY = renderY + focusedCell.row * cellHeight;

    // Dim non-focused cells slightly for contrast focus
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(renderX, renderY, renderWidth, renderHeight);

    // Re-reveal focused cell
    ctx.save();
    ctx.beginPath();
    ctx.rect(fX, fY, cellWidth, cellHeight);
    ctx.clip();

    ctx.translate(renderX + renderWidth / 2, renderY + renderHeight / 2);
    if (filters.rotation !== 0) ctx.rotate((filters.rotation * Math.PI) / 180);
    ctx.scale(scaleX, scaleY);
    ctx.filter = buildFilterString(filters);
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Warm amber glow ring around focused cell
    ctx.save();
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = Math.max(3 * scale, 3);
    ctx.strokeRect(fX, fY, cellWidth, cellHeight);
    ctx.restore();
  }

  // 4. Subdivisions (Fine inner lines)
  if (grid.subdivisions > 1) {
    ctx.save();
    ctx.strokeStyle = grid.color;
    ctx.globalAlpha = grid.opacity * grid.subdivisionOpacity;
    ctx.lineWidth = Math.max(1, grid.subdivisionThickness * scale);

    if (grid.subdivisionStyle === 'dashed') {
      ctx.setLineDash([4 * scale, 4 * scale]);
    } else if (grid.subdivisionStyle === 'dotted') {
      ctx.setLineDash([2 * scale, 3 * scale]);
      ctx.lineCap = 'round';
    } else {
      ctx.setLineDash([]);
    }

    const subSteps = grid.subdivisions;
    // Sub-vertical lines
    for (let c = 0; c < columns; c++) {
      for (let s = 1; s < subSteps; s++) {
        const x = renderX + c * cellWidth + (s * cellWidth) / subSteps;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, renderY);
        ctx.lineTo(Math.round(x) + 0.5, renderY + renderHeight);
        ctx.stroke();
      }
    }
    // Sub-horizontal lines
    for (let r = 0; r < rows; r++) {
      for (let s = 1; s < subSteps; s++) {
        const y = renderY + r * cellHeight + (s * cellHeight) / subSteps;
        ctx.beginPath();
        ctx.moveTo(renderX, Math.round(y) + 0.5);
        ctx.lineTo(renderX + renderWidth, Math.round(y) + 0.5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 5. Diagonals
  if (grid.diagonals !== 'none') {
    ctx.save();
    ctx.strokeStyle = grid.color;
    ctx.globalAlpha = grid.opacity * grid.diagonalOpacity;
    ctx.lineWidth = Math.max(1, (grid.thickness * 0.75) * scale);
    ctx.setLineDash([4 * scale, 3 * scale]);

    if (grid.diagonals === 'full') {
      // Corner to corner across full image
      ctx.beginPath();
      ctx.moveTo(renderX, renderY);
      ctx.lineTo(renderX + renderWidth, renderY + renderHeight);
      ctx.moveTo(renderX + renderWidth, renderY);
      ctx.lineTo(renderX, renderY + renderHeight);
      ctx.stroke();
    } else if (grid.diagonals === 'cell') {
      // X across each individual cell
      for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          const x1 = renderX + c * cellWidth;
          const y1 = renderY + r * cellHeight;
          const x2 = x1 + cellWidth;
          const y2 = y1 + cellHeight;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.moveTo(x2, y1);
          ctx.lineTo(x1, y2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // 6. Primary Grid Lines
  ctx.save();
  ctx.strokeStyle = grid.color;
  ctx.globalAlpha = grid.opacity;
  ctx.lineWidth = Math.max(1, grid.thickness * scale);

  if (grid.style === 'dashed') {
    ctx.setLineDash([8 * scale, 6 * scale]);
  } else if (grid.style === 'dotted') {
    ctx.setLineDash([3 * scale, 4 * scale]);
    ctx.lineCap = 'round';
  } else {
    ctx.setLineDash([]);
  }

  // Draw Vertical Lines
  for (let c = 0; c <= columns; c++) {
    const x = Math.round(renderX + c * cellWidth) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, renderY);
    ctx.lineTo(x, renderY + renderHeight);
    ctx.stroke();
  }

  // Draw Horizontal Lines
  for (let r = 0; r <= rows; r++) {
    const y = Math.round(renderY + r * cellHeight) + 0.5;
    ctx.beginPath();
    ctx.moveTo(renderX, y);
    ctx.lineTo(renderX + renderWidth, y);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Center Crosshairs (if enabled)
  if (grid.showCenterLines) {
    ctx.save();
    ctx.strokeStyle = grid.centerLineColor || '#ef4444';
    ctx.globalAlpha = Math.min(1, grid.opacity + 0.2);
    ctx.lineWidth = Math.max(1.5, (grid.thickness * 1.3) * scale);
    ctx.setLineDash([]);

    const centerX = Math.round(renderX + renderWidth / 2) + 0.5;
    const centerY = Math.round(renderY + renderHeight / 2) + 0.5;

    ctx.beginPath();
    ctx.moveTo(centerX, renderY);
    ctx.lineTo(centerX, renderY + renderHeight);
    ctx.moveTo(renderX, centerY);
    ctx.lineTo(renderX + renderWidth, centerY);
    ctx.stroke();
    ctx.restore();
  }

  // 8. Labels
  if (grid.showLabels && grid.labelPosition !== 'none') {
    ctx.save();
    const fontSize = Math.max(10, Math.round(grid.labelSize * scale));
    ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = 'top';

    if (grid.labelPosition === 'inside-corner') {
      // Coordinates inside each cell (e.g. A1, B2)
      for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          const text = getCellCoordinate(c, r, grid.labelFormat);
          const x = renderX + c * cellWidth + 6 * scale;
          const y = renderY + r * cellHeight + 6 * scale;

          if (grid.labelBackground) {
            const metrics = ctx.measureText(text);
            const padX = 4 * scale;
            const padY = 2 * scale;
            ctx.fillStyle = 'rgba(10, 10, 12, 0.75)';
            ctx.beginPath();
            ctx.roundRect(
              x - padX,
              y - padY,
              metrics.width + padX * 2,
              fontSize + padY * 2,
              3 * scale
            );
            ctx.fill();
          }

          ctx.fillStyle = grid.labelColor;
          ctx.fillText(text, x, y);
        }
      }
    } else if (grid.labelPosition === 'margin') {
      // Column labels along top
      ctx.textAlign = 'center';
      for (let c = 0; c < columns; c++) {
        const text = getColumnLabel(c, grid.labelFormat);
        const x = renderX + (c + 0.5) * cellWidth;
        const y = rulerMargin > 0 ? (rulerMargin - fontSize) / 2 : renderY + 6 * scale;

        if (rulerMargin === 0 && grid.labelBackground) {
          const metrics = ctx.measureText(text);
          ctx.fillStyle = 'rgba(10, 10, 12, 0.75)';
          ctx.beginPath();
          ctx.roundRect(
            x - metrics.width / 2 - 4 * scale,
            y - 2 * scale,
            metrics.width + 8 * scale,
            fontSize + 4 * scale,
            3 * scale
          );
          ctx.fill();
        }

        ctx.fillStyle = grid.labelColor;
        ctx.fillText(text, x, y);
      }

      // Row labels along left
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let r = 0; r < rows; r++) {
        const text = getRowLabel(r);
        const x = rulerMargin > 0 ? rulerMargin - 8 * scale : renderX + fontSize * 1.5;
        const y = renderY + (r + 0.5) * cellHeight;

        if (rulerMargin === 0 && grid.labelBackground) {
          const metrics = ctx.measureText(text);
          ctx.fillStyle = 'rgba(10, 10, 12, 0.75)';
          ctx.beginPath();
          ctx.roundRect(
            x - metrics.width - 4 * scale,
            y - fontSize / 2 - 2 * scale,
            metrics.width + 8 * scale,
            fontSize + 4 * scale,
            3 * scale
          );
          ctx.fill();
        }

        ctx.fillStyle = grid.labelColor;
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }
}

/**
 * Creates a blank matching paper grid sheet suitable for printing or reference!
 */
export function generateMatchingBlankGrid({
  width,
  height,
  columns,
  rows,
  color = '#94a3b8',
  subdivisions = 1,
}: {
  width: number;
  height: number;
  columns: number;
  rows: number;
  color?: string;
  subdivisions?: number;
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean white paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const cellW = width / columns;
  const cellH = height / rows;

  // Subdivisions
  if (subdivisions > 1) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let c = 0; c < columns; c++) {
      for (let s = 1; s < subdivisions; s++) {
        const x = c * cellW + (s * cellW) / subdivisions;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let s = 1; s < subdivisions; s++) {
        const y = r * cellH + (s * cellH) / subdivisions;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }

  // Primary lines
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  for (let c = 0; c <= columns; c++) {
    const x = c * cellW;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let r = 0; r <= rows; r++) {
    const y = r * cellH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Edge labels for drawing on paper
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  for (let c = 0; c < columns; c++) {
    ctx.fillText(getColumnLabel(c, 'alpha-numeric'), (c + 0.5) * cellW, 16);
  }
  ctx.textAlign = 'left';
  for (let r = 0; r < rows; r++) {
    ctx.fillText(getRowLabel(r), 6, (r + 0.5) * cellH + 4);
  }

  return canvas.toDataURL('image/png');
}
