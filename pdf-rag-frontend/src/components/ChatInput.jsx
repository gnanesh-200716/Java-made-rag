import React, { useRef, useEffect } from 'react';

export default function ChatInput({
  question,
  setQuestion,
  onSend,
  loading,
  filesCount,
  onUploadClick,
}) {
  const textareaRef = useRef(null);

  // Clean auto-resize up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${Math.max(newHeight, 38)}px`;
    }
  }, [question]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        if (question.trim() && !loading) {
          onSend();
        }
      }
    }
  };

  return (
    <div className="absolute bottom-5 left-0 right-0 px-4 sm:px-6 pointer-events-none z-30">
      <div className="max-w-[760px] mx-auto pointer-events-auto">
        <div className="bg-white rounded-lg border border-border-strong shadow-composer p-2.5 transition-colors focus-within:border-ink">
          <textarea
            ref={textareaRef}
            className="w-full resize-none border-0 p-1 text-[14px] text-ink placeholder:text-ink-faint focus:ring-0 focus:outline-none leading-normal font-sans"
            placeholder="Ask a question about your documents..."
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-1 text-ink-secondary text-[12px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 rounded hover:text-ink hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium"
                onClick={onUploadClick}
                title="Attach additional PDF files"
              >
                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                <span>Attach</span>
              </button>

              <span className="text-ink-faint">·</span>

              <span className="text-ink-tertiary">
                {filesCount > 0 ? `${filesCount} ${filesCount === 1 ? 'file' : 'files'} attached` : 'No files'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-faint hidden sm:inline font-mono">
                Enter ↵
              </span>
              <button
                type="button"
                className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                onClick={onSend}
                disabled={!question.trim() || loading}
                title="Send inquiry"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-faint mt-1.5 font-mono">
          DocMind searches verified document vectors to generate grounded answers.
        </p>
      </div>
    </div>
  );
}
