import React from 'react';
import { X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageItem } from '../utils/sampleImages';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sampleId: string) => void;
  currentSampleId?: string;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  currentSampleId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100 tracking-tight">
                Curated Drawing Reference Studies
              </h3>
              <p className="text-xs text-neutral-400">
                Classical masterclass subjects designed for grid proportion and shading practice
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

        {/* Gallery List */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = currentSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample.id);
                  onClose();
                }}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                    {sample.category}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {sample.aspect}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-200 transition-colors mb-1">
                  {sample.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ideal for practicing proportion, line weight, and chiaroscuro tonal shading.
                </p>
                {isSelected && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-medium mt-3">
                    <Check className="w-3.5 h-3.5" />
                    <span>Currently Active</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
