
# 📄 DocMind

**A Java-powered RAG chatbot for intelligent PDF question answering.**

DocMind is a full-stack **Retrieval-Augmented Generation (RAG)** application built using **Java 17, Spring Boot, Spring AI, and Google Gemini**.

Unlike many RAG projects built with Python-based AI frameworks, DocMind implements the core RAG pipeline in the **Java ecosystem**, including PDF processing, chunking, embeddings, vector storage, semantic retrieval, and AI response generation.

## ✨ Features

- 📄 PDF upload and text extraction
- ✂️ Intelligent text chunking
- 🧠 Gemini embeddings
- 🔎 Semantic search using cosine similarity
- 📚 Top-5 relevant chunk retrieval
- 🤖 Gemini-powered answers
- ☕ Java-based RAG backend
- 🌐 React + Vite frontend
- 🚀 Spring Boot REST APIs

## 🔥 RAG Pipeline

```text
PDF
 ↓
Apache PDFBox
 ↓
Text Chunking
 ↓
Gemini Embeddings
 ↓
Java Vector Store
 ↓
Cosine Similarity
 ↓
Top 5 Chunks
 ↓
Gemini
 ↓
Answer
````

## ☕ Why Java?

DocMind explores how a complete RAG application can be built using **Java and Spring Boot** instead of relying on a typical Python RAG stack.

The retrieval logic is implemented directly in Java, including the custom in-memory vector store and cosine similarity search.

## 🛠️ Tech Stack

**Backend**

* Java 17
* Spring Boot 4.1.1
* Spring AI 2.0.1
* Maven
* Apache PDFBox 3.0.5

**AI**

* Google Gemini
* Gemini Embeddings
* Retrieval-Augmented Generation

**Frontend**

* React
* Vite
* JavaScript
* CSS

## 📁 Project Structure

```text
pdf-rag/
├── controller/
│   ├── PdfController.java
│   ├── EmbeddingController.java
│   └── RagController.java
│
├── service/
│   ├── PdfService.java
│   ├── TextChunker.java
│   ├── EmbeddingService.java
│   ├── VectorStore.java
│   └── RagService.java
│
├── resources/
│   └── application.properties
│
└── pom.xml
```

## ⚙️ Setup

Set your Gemini API key:

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Run the backend:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8081
```

Run the frontend:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔗 API

### Upload PDF

```http
POST /pdf/upload
```

### Ask a Question

```http
GET /rag?question=YOUR_QUESTION
```

## ⚠️ Current Limitations

* Vector store is currently in memory
* Restarting the backend clears stored embeddings
* No persistent vector database yet
* No page-level citations
* PDF documents only

## 🚧 Future Improvements

* Persistent vector database
* Document management
* Page-level citations
* Conversation history
* Authentication
* OCR support
* Multiple document collections
* Production deployment

### ☕ Built with Java • ⚡ Powered by Gemini • 🧠 Built around RAG

```
```
