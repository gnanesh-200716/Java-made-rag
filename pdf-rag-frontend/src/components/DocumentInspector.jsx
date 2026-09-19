import React from 'react';

export default function DocumentInspector({ document, onClose, onRemove, onNotify }) {
  if (!document) return null;

  const { file, status, uploadedAt } = document;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    try {
      const url = URL.createObjectURL(file);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = file.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (onNotify) onNotify(`Downloaded "${file.name}"`);
    } catch (e) {
      if (onNotify) onNotify('Unable to download file', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-[1px] transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white h-full shadow-drawer border-l border-border flex flex-col justify-between transform transition-transform duration-150 ease-out animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] font-semibold px-1 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border">
              PDF
            </span>
            <h3 className="font-semibold text-[13px] text-ink truncate">
              {file.name}
            </h3>
          </div>
          <button
            type="button"
            className="p-1 rounded text-ink-tertiary hover:text-ink hover:bg-surface-subtle transition-colors"
            onClick={onClose}
            title="Close panel"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[13px]">
          <div>
            <span className="text-[10.5px] font-semibold text-ink-tertiary uppercase tracking-wider block mb-2">
              Document Metadata
            </span>
            <div className="border border-border rounded divide-y divide-border-subtle bg-surface-subtle">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-ink-tertiary text-[12px]">Type</span>
                <span className="font-mono text-[12px] font-medium text-ink">PDF Document</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-ink-tertiary text-[12px]">File Size</span>
                <span className="font-mono text-[12px] font-medium text-ink">{formatFileSize(file.size)}</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-ink-tertiary text-[12px]">Indexing Status</span>
                <span
                  className={`font-semibold text-[12px] ${
                    status === 'Ready'
                      ? 'text-success'
                      : status === 'Failed'
                      ? 'text-danger'
                      : 'text-amber-700'
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-ink-tertiary text-[12px]">Added</span>
                <span className="text-[12px] text-ink font-medium">
                  {uploadedAt ? new Date(uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Session'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10.5px] font-semibold text-ink-tertiary uppercase tracking-wider block mb-2">
              Backend Integration
            </span>
            <p className="text-[12.5px] text-ink-secondary leading-relaxed">
              {status === 'Ready' && 'Text extracted via Apache PDFBox and stored in the Spring AI in-memory vector store for top-5 semantic retrieval.'}
              {status === 'Processing' && 'Backend is extracting text chunks and generating vector embeddings with Gemini.'}
              {status === 'Failed' && 'Upload or vector indexing failed. Ensure the Spring Boot service is accessible.'}
            </p>
          </div>

          <div>
            <span className="text-[10.5px] font-semibold text-ink-tertiary uppercase tracking-wider block mb-2">
              Actions
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-white hover:bg-surface-subtle text-[12.5px] text-ink transition-colors text-left"
                onClick={handleDownload}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-ink-secondary">download</span>
                  <span>Download original file</span>
                </span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 rounded border border-red-200 bg-white hover:bg-danger-soft text-[12.5px] text-danger transition-colors text-left"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Remove from workspace</span>
                </span>
                <span className="text-[10.5px] text-red-400 font-mono">Frontend list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-end">
          <button
            type="button"
            className="px-3 py-1 rounded bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
