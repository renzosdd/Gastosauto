import { Download, FileJson, Plus, RotateCcw, Upload } from 'lucide-react';
import { useRef } from 'react';

interface ImportExportControlsProps {
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onAddVehicle: () => void;
  addLabel?: string;
}

export function ImportExportControls({
  onExport,
  onImport,
  onReset,
  onAddVehicle,
  addLabel = 'Agregar vehiculo',
}: ImportExportControlsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-wrap gap-3">
      <button className="action-button-primary" type="button" onClick={onAddVehicle}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
      <button className="action-button" type="button" onClick={onExport}>
        <Download className="h-4 w-4" />
        Exportar JSON
      </button>
      <button className="action-button" type="button" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Importar JSON
      </button>
      <button className="action-button" type="button" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Resetear
      </button>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            onImport(file);
          }

          event.target.value = '';
        }}
      />
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
        <FileJson className="h-4 w-4" />
        Persistencia automatica en localStorage
      </div>
    </div>
  );
}
