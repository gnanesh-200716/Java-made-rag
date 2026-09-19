import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WorkspaceHeader from './components/WorkspaceHeader';
import ChatCanvas from './components/ChatCanvas';
import ChatInput from './components/ChatInput';
import DocumentInspector from './components/DocumentInspector';
import Toast from './components/Toast';

const API = 'http://localhost:8081';

export default function App() {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [activeChatIndex, setActiveChatIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);
  const toastTimeoutRef = useRef(null);

  // Toast notifier
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  // Upload PDF documents to Spring Boot backend
  const uploadFiles = useCallback(async (selectedFiles) => {
    if (!selectedFiles || !selectedFiles.length) return;

    // Show files immediately in Processing state
    const newFiles = selectedFiles.map((file) => ({
      file: file,
      status: "Processing",
      uploadedAt: new Date().toISOString(),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);
    showToast(`Uploading ${newFiles.length} file${newFiles.length === 1 ? '' : 's'}...`);

    // Process each file with the exact backend upload contract
    for (const item of newFiles) {
      const formData = new FormData();
      formData.append("file", item.file);

      console.log("Starting upload for file:", item.file.name, "Size:", item.file.size, "Type:", item.file.type);

      try {
        const response = await fetch(`${API}/pdf/upload`, {
          method: "POST",
          body: formData,
        });

        const result = await response.text();

        console.log("Upload status:", response.status);
        console.log("Upload response:", result);

        if (response.ok) {
          setFiles((prev) =>
            prev.map((item2) =>
              item2.file === item.file
                ? {
                    ...item2,
                    status: "Ready",
                  }
                : item2
            )
          );
          showToast(`✓ Ready: "${item.file.name}"`);
        } else {
          console.error(`Upload failed with status ${response.status}:`, result);
          setFiles((prev) =>
            prev.map((item2) =>
              item2.file === item.file
                ? {
                    ...item2,
                    status: "Failed",
                  }
                : item2
            )
          );
          showToast(`✕ Failed: "${item.file.name}" (${response.status}: ${result})`, 'error');
        }
      } catch (error) {
        console.error("Upload error (Network/CORS):", error);
        setFiles((prev) =>
          prev.map((item2) =>
            item2.file === item.file
              ? {
                  ...item2,
                  status: "Failed",
                }
              : item2
          )
        );
        showToast(`✕ Upload failed: ${error.message}. Ensure backend is on ${API} and frontend on port 5173.`, 'error');
      }
    }

    setUploading(false);
  }, [showToast]);

  // Ask question through Spring Boot /rag endpoint
  const askQuestion = useCallback(async (overrideQuestion) => {
    const queryText = (overrideQuestion || question).trim();
    if (!queryText || loading) return;

    // Add user message
    const userMsg = { role: 'user', text: queryText, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    // Save to recent queries list
    setRecentChats((prev) => {
      const exists = prev.some((c) => c.question.toLowerCase() === queryText.toLowerCase());
      if (exists) return prev;
      return [{ title: queryText.slice(0, 36) + (queryText.length > 36 ? '...' : ''), question: queryText }, ...prev.slice(0, 14)];
    });

    try {
      const response = await fetch(`${API}/rag?question=${encodeURIComponent(queryText)}`);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const answer = await response.text();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: answer || 'No grounded answer could be generated from the indexed documents.',
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Question error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to connect to the Spring Boot RAG server at `http://localhost:8081`. Please ensure the backend is running.',
          createdAt: new Date(),
        },
      ]);
      showToast('Failed to connect to RAG server', 'error');
    } finally {
      setLoading(false);
    }
  }, [question, loading, showToast]);

  // Start new chat (clears messages, preserves files)
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setQuestion('');
    setActiveChatIndex(null);
    showToast('Started new research session');
  }, [showToast]);

  // Select a recent conversation
  const handleSelectRecentChat = useCallback((chat, index) => {
    setActiveChatIndex(index);
    setQuestion(chat.question);
    showToast(`Loaded "${chat.title}" into inquiry`);
  }, [showToast]);

  // Remove document from frontend list
  const handleRemoveDocument = useCallback((index) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        showToast(`Removed "${removed.file.name}" from workspace`);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [showToast]);

  // Export research memo to markdown file
  const handleExportMemo = useCallback(() => {
    if (messages.length === 0) {
      showToast('No conversation to export yet', 'error');
      return;
    }

    let markdown = `# DocMind Research Memo\nGenerated: ${new Date().toLocaleString()}\n`;
    markdown += `Referenced Documents: ${files.map((f) => f.file.name).join(', ') || 'None'}\n\n---\n\n`;

    messages.forEach((msg) => {
      if (msg.role === 'user') {
        markdown += `### Inquiry:\n${msg.text}\n\n`;
      } else {
        markdown += `### Synthesis (DocMind):\n${msg.text}\n\n---\n\n`;
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocMind_Research_Memo_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Research memo exported as Markdown');
  }, [messages, files, showToast]);

  // Keyboard shortcut: Cmd/Ctrl + N for new chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  // Drag and drop PDF files onto the app window
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles([...e.dataTransfer.files]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-canvas font-sans text-ink relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-canvas/95 backdrop-blur-[1px] border-2 border-dashed border-primary flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded bg-surface border border-border flex items-center justify-center text-primary mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">upload_file</span>
          </div>
          <h3 className="font-serif text-[18px] font-semibold text-ink">
            Drop PDF Documents
          </h3>
          <p className="text-[12.5px] text-ink-secondary mt-1">
            Files will be parsed and indexed into vector memory
          </p>
        </div>
      )}

      {/* Left Sidebar (Notion/Linear Inspired) */}
      <Sidebar
        files={files}
        uploading={uploading}
        onUploadFiles={uploadFiles}
        onNewChat={handleNewChat}
        onSelectDocument={(doc) => setSelectedDocument(doc)}
        onRemoveDocument={handleRemoveDocument}
        recentChats={recentChats}
        onSelectRecentChat={handleSelectRecentChat}
        activeChatIndex={activeChatIndex}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <WorkspaceHeader
          files={files}
          onUploadFiles={uploadFiles}
          onSelectDocument={(doc) => setSelectedDocument(doc)}
          onRemoveDocument={handleRemoveDocument}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onExportMemo={handleExportMemo}
          onNotify={showToast}
        />

        {/* Reading & Chat Canvas */}
        <ChatCanvas
          messages={messages}
          loading={loading}
          files={files}
          onSelectSuggestion={(suggestion) => {
            setQuestion(suggestion);
            askQuestion(suggestion);
          }}
          onInspectDocument={(doc) => setSelectedDocument(doc)}
          onRetry={(lastQ) => askQuestion(lastQ)}
          onNotify={showToast}
        />

        {/* Floating Chat Input Dock */}
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSend={() => askQuestion()}
          loading={loading}
          filesCount={files.length}
          onUploadClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf';
            input.multiple = true;
            input.onchange = (e) => {
              if (e.target.files) uploadFiles([...e.target.files]);
            };
            input.click();
          }}
        />
      </div>

      {/* Document Inspector Drawer */}
      <DocumentInspector
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onRemove={() => {
          if (selectedDocument) {
            const idx = files.findIndex((f) => f.file === selectedDocument.file);
            if (idx !== -1) handleRemoveDocument(idx);
          }
        }}
        onNotify={showToast}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} />
    </div>
  );
}