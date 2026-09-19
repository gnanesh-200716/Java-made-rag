import React, { useRef } from 'react';

export default function WorkspaceHeader({
  files,
  onUploadFiles,
  onSelectDocument,
  onRemoveDocument,
  onToggleSidebar,
  onExportMemo,
  onNotify,
}) {
  const fileInputRef = useRef(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    if (onNotify) onNotify('Workspace link copied to clipboard');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles([...e.target.files]);
      e.target.value = '';
    }
  };

  return (
    <header className="h-11 bg-white border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 text-[12.5px]">
      {/* Left: Mobile Toggle & Focused Document Scope */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          className="md:hidden p-1 rounded text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors mr-1"
          onClick={onToggleSidebar}
          title="Toggle navigation sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">menu</span>
        </button>

        <span className="text-ink-tertiary font-medium hidden sm:inline shrink-0 text-[12px]">
          Focused documents:
        </span>

        {files.length === 0 ? (
          <span className="text-ink-faint italic truncate text-[12px]">
            No documents selected
          </span>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {files.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink hover:border-border-strong transition-colors group cursor-pointer shrink-0 text-[11.5px]"
                onClick={() => onSelectDocument(item)}
                title={`${item.file.name} — Click to inspect`}
              >
                <span className="font-mono text-[9px] font-semibold text-ink-secondary">
                  PDF
                </span>
                <span className="truncate max-w-[130px] font-medium">
                  {item.file.name}
                </span>
                <button
                  type="button"
                  className="material-symbols-outlined text-[13px] text-ink-tertiary hover:text-danger rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDocument(index);
                  }}
                  title="Remove from scope"
                >
                  close
                </button>
              </div>
            ))}
            {files.length > 3 && (
              <span className="text-[11px] font-mono text-ink-tertiary shrink-0">
                +{files.length - 3} more
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors shrink-0 text-[11.5px] font-medium"
          onClick={() => fileInputRef.current?.click()}
          title="Attach PDF file"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span className="hidden sm:inline">Add</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Right: Model Label & Quiet Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-[11.5px] text-ink-secondary font-medium">
          Model: <span className="text-ink font-semibold">Gemini</span>
        </div>

        <div className="h-3.5 w-px bg-border-subtle hidden sm:block"></div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors font-medium text-[12px]"
            onClick={onExportMemo}
            title="Export research memo to Markdown"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors font-medium text-[12px]"
            onClick={handleCopyLink}
            title="Copy shareable link"
          >
            <span className="material-symbols-outlined text-[15px]">link</span>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
}
