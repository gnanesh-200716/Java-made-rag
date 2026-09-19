import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatCanvas({
  messages,
  loading,
  files,
  onSelectSuggestion,
  onInspectDocument,
  onRetry,
  onNotify,
}) {
  const canvasRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const loadingPhases = [
    'Searching indexed document chunks...',
    'Evaluating semantic relevance...',
    'Synthesizing findings with Gemini...',
  ];

  // Rotate loading phase during inquiry
  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % loadingPhases.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  // Auto-scroll as messages appear
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        top: canvasRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    if (onNotify) onNotify('Research memo copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const suggestions = [
    'Summarize this document',
    'What are the key concepts?',
    'What problem does this document address?',
    'Find the most important information',
  ];

  return (
    <main ref={canvasRef} className="flex-1 overflow-y-auto bg-canvas" id="chat-canvas">
      <div className="max-w-[760px] mx-auto px-6 py-10 sm:py-14 space-y-12">
        {messages.length === 0 ? (
          /* RESTRAINED, DIGNIFIED EMPTY STATE */
          <div className="py-12 max-w-lg">
            <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-serif font-bold text-[13px] mb-4">
              D
            </div>

            <h1 className="font-serif text-[22px] font-semibold text-ink tracking-tight mb-2">
              Document Assistant
            </h1>

            <p className="text-[14px] text-ink-secondary leading-relaxed mb-8">
              Ask questions about your documents. Upload a PDF to begin researching its contents. DocMind retrieves relevant passages and synthesizes grounded answers.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider block mb-2">
                Suggested inquiries
              </span>
              <div className="space-y-1.5">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 rounded border border-border bg-white hover:bg-surface-subtle hover:border-border-strong transition-colors text-[13px] text-ink flex items-center justify-between group"
                  >
                    <span>{item}</span>
                    <span className="material-symbols-outlined text-[15px] text-ink-tertiary group-hover:text-ink transition-colors">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {files.length === 0 && (
              <p className="text-[12px] text-ink-tertiary mt-8">
                Upload a PDF using the sidebar to ground responses in your files.
              </p>
            )}
          </div>
        ) : (
          /* CONVERSATION STREAM (EDITORIAL RESEARCH FORMAT) */
          messages.map((message, index) => {
            if (message.role === 'user') {
              return (
                <div key={index} className="pt-4 pb-2 border-b border-border-subtle">
                  <div className="text-[11.5px] font-semibold text-ink-tertiary mb-1.5 uppercase tracking-wider">
                    Inquiry
                  </div>
                  <p className="font-sans font-medium text-[16px] text-ink leading-relaxed">
                    {message.text}
                  </p>
                </div>
              );
            }

            // AI Answer (Research Memo)
            const userQuery = index > 0 ? messages[index - 1]?.text : 'Document Findings';

            return (
              <article key={index} className="space-y-6 pt-2">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-serif font-bold text-[10.5px]">
                      D
                    </div>
                    <span className="font-semibold text-[13px] text-ink">DocMind</span>
                    <span className="text-[11.5px] text-ink-tertiary">· Research Memo</span>
                  </div>
                </div>

                {/* Research Title */}
                <div>
                  <h2 className="font-serif text-[20px] font-semibold text-ink tracking-tight mb-2">
                    Analysis &amp; Synthesis
                  </h2>
                  <div className="h-px w-full bg-border-subtle"></div>
                </div>

                {/* Formatted Markdown Body */}
                <div className="research-memo">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>

                {/* Restrained Sources Table */}
                {files.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-border-subtle">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider">
                        Sources
                      </span>
                      <span className="text-[11px] text-ink-tertiary font-mono">
                        {files.length} indexed {files.length === 1 ? 'document' : 'documents'}
                      </span>
                    </div>

                    <div className="border border-border rounded divide-y divide-border-subtle bg-white text-[12.5px]">
                      {files.map((item, fIdx) => (
                        <div
                          key={fIdx}
                          onClick={() => onInspectDocument(item)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-surface-subtle transition-colors cursor-pointer group"
                          title="Click to view file details"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[11px] text-ink-tertiary w-3">
                              {fIdx + 1}
                            </span>
                            <span className="font-mono text-[9.5px] px-1 py-0.2 rounded bg-canvas text-ink-secondary border border-border">
                              PDF
                            </span>
                            <span className="font-medium text-ink truncate group-hover:text-accent transition-colors">
                              {item.file.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-ink-tertiary text-[11.5px]">
                            <span>{(item.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                            <span className="text-success font-medium text-[11px]">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiet Action Toolbar */}
                <div className="flex items-center gap-3 pt-2 text-[12px] text-ink-tertiary border-t border-border-subtle/60">
                  <button
                    type="button"
                    className="hover:text-ink flex items-center gap-1 transition-colors"
                    onClick={() => handleCopy(message.text, index)}
                    title="Copy answer text"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {copiedIndex === index ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    className="hover:text-ink flex items-center gap-1 transition-colors"
                    onClick={() => onRetry(userQuery)}
                    title="Re-run this inquiry"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    <span>Retry</span>
                  </button>

                  {files.length > 0 && (
                    <button
                      type="button"
                      className="hover:text-ink flex items-center gap-1 transition-colors"
                      onClick={() => onInspectDocument(files[0])}
                      title="Inspect original document"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Inspect PDF</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}

        {/* AI LOADING STATE */}
        {loading && (
          <article className="space-y-3 pt-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-ink">
              <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-serif font-bold text-[10.5px]">
                D
              </div>
              <span className="font-semibold text-[13px]">DocMind</span>
              <span className="text-[11.5px] text-ink-tertiary">· Synthesizing</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-ink-secondary py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              <span>{loadingPhases[loadingPhase]}</span>
            </div>
          </article>
        )}

        {/* Bottom spacing for composer */}
        <div className="h-32"></div>
      </div>
    </main>
  );
}
