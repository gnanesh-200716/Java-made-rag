import React, { useRef } from 'react';

export default function Sidebar({
  files,
  uploading,
  onUploadFiles,
  onNewChat,
  onSelectDocument,
  onRemoveDocument,
  recentChats,
  onSelectRecentChat,
  activeChatIndex,
  isOpen,
  onCloseMobile,
}) {
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles([...e.target.files]);
      e.target.value = '';
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/20 backdrop-blur-[1px] z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-[250px] bg-sidebar border-r border-border-subtle flex flex-col justify-between shrink-0 select-none transform transition-transform duration-150 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Brand Header */}
          <div className="px-4 py-3.5 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-serif font-bold text-[11px] shrink-0">
                D
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[13px] text-ink block leading-tight tracking-tight">
                  DocMind
                </span>
                <span className="text-[11px] text-ink-tertiary block leading-tight truncate">
                  AI Document Research
                </span>
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-3 pt-3 pb-2">
            <button
              type="button"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-border text-ink hover:bg-surface-subtle hover:border-border-strong transition-colors font-medium text-[12.5px] shadow-sm group text-left"
              onClick={onNewChat}
              title="Start a new chat (⌘N or Ctrl+N)"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-ink-secondary">
                  add
                </span>
                <span>New Chat</span>
              </span>
              <kbd className="text-[10px] font-mono text-ink-tertiary bg-sidebar px-1 py-0.2 rounded border border-border-subtle">
                ⌘N
              </kbd>
            </button>
          </div>

          {/* Navigation Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
            {/* Recent Inquiries */}
            <div>
              <div className="px-1.5 pb-1 flex items-center justify-between">
                <span className="text-[10.5px] font-semibold text-ink-tertiary uppercase tracking-wider">
                  Recent
                </span>
              </div>
              <div className="space-y-0.5">
                {recentChats && recentChats.length > 0 ? (
                  recentChats.map((chat, idx) => {
                    const isActive = activeChatIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectRecentChat(chat, idx)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] transition-colors text-left truncate ${
                          isActive
                            ? 'bg-white text-ink font-medium shadow-sm border border-border-subtle'
                            : 'text-ink-secondary hover:text-ink hover:bg-sidebar-hover'
                        }`}
                        title={chat.title || chat.question}
                      >
                        <span className="material-symbols-outlined text-[14px] text-ink-tertiary shrink-0">
                          chat_bubble_outline
                        </span>
                        <span className="truncate">{chat.title || chat.question}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2 py-1 text-[11.5px] text-ink-faint">
                    No recent inquiries
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <div className="px-1.5 pb-1 flex items-center justify-between">
                <span className="text-[10.5px] font-semibold text-ink-tertiary uppercase tracking-wider">
                  Documents
                </span>
                <button
                  type="button"
                  className="text-ink-tertiary hover:text-ink transition-colors text-[11.5px] flex items-center gap-1 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload PDF document"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Upload</span>
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

              {/* Upload Drop Target / Quick Action */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 mb-2 p-2 rounded border border-dashed border-border hover:border-border-strong bg-white/50 hover:bg-white transition-all text-center cursor-pointer group"
                title="Click to select PDF files"
              >
                <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-ink-secondary group-hover:text-ink font-medium">
                  <span className="material-symbols-outlined text-[14px]">
                    {uploading ? 'sync' : 'upload_file'}
                  </span>
                  <span>{uploading ? 'Processing file...' : 'Choose PDF document'}</span>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-0.5">
                {files.length === 0 ? (
                  <div className="px-2 py-3 text-center text-ink-faint text-[11.5px]">
                    No documents attached
                  </div>
                ) : (
                  files.map((item, index) => {
                    const isProcessing = item.status === 'Processing';
                    const isReady = item.status === 'Ready';
                    const isFailed = item.status === 'Failed';

                    return (
                      <div
                        key={index}
                        onClick={() => onSelectDocument(item)}
                        className="group flex items-center justify-between px-2 py-1.5 rounded text-[12px] text-ink hover:bg-sidebar-hover transition-colors cursor-pointer"
                        title={`${item.file.name} — Click to inspect`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-white text-ink-secondary border border-border shrink-0">
                            PDF
                          </span>
                          <span className="truncate text-ink font-medium">{item.file.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {isProcessing && (
                            <span className="text-[10px] font-mono text-amber-700 flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Indexing
                            </span>
                          )}
                          {isReady && (
                            <span className="text-[10.5px] font-mono text-success group-hover:hidden">
                              Ready
                            </span>
                          )}
                          {isFailed && (
                            <span className="text-[10.5px] font-mono text-danger">
                              Failed
                            </span>
                          )}

                          <button
                            type="button"
                            className="hidden group-hover:inline-flex text-ink-tertiary hover:text-ink p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDocument(item);
                            }}
                            title="Inspect details"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              info
                            </span>
                          </button>

                          <button
                            type="button"
                            className="hidden group-hover:inline-flex text-ink-tertiary hover:text-danger p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveDocument(index);
                            }}
                            title="Remove document"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer: System Status & Minimal Settings */}
          <div className="p-3 border-t border-border-subtle bg-sidebar text-[11.5px] text-ink-secondary flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-medium">RAG Online</span>
              <span className="text-ink-faint">· Spring AI</span>
            </div>

            <button
              type="button"
              className="text-ink-tertiary hover:text-ink p-1 rounded hover:bg-sidebar-hover transition-colors"
              title="System Information"
              onClick={() => alert('DocMind Document Research · Spring AI + Gemini')}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
