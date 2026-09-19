package com.gnanesh.pdfrag.controller;

import com.gnanesh.pdfrag.service.EmbeddingService;
import com.gnanesh.pdfrag.service.PdfService;
import com.gnanesh.pdfrag.service.TextChunker;
import com.gnanesh.pdfrag.service.VectorStore;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@RequestMapping("/pdf")
public class PdfController {

    private final PdfService pdfService;
    private final TextChunker textChunker;
    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;

    public PdfController(
            PdfService pdfService,
            TextChunker textChunker,
            EmbeddingService embeddingService,
            VectorStore vectorStore) {

        this.pdfService = pdfService;
        this.textChunker = textChunker;
        this.embeddingService = embeddingService;
        this.vectorStore = vectorStore;
    }

    @PostMapping("/upload")
    public String uploadPdf(@RequestParam("file") MultipartFile file)
            throws Exception {

        String text = pdfService.extractText(file);

        List<String> chunks = textChunker.chunkText(text);

        for (String chunk : chunks) {

            float[] embedding =
                    embeddingService.generateEmbedding(chunk);

            vectorStore.add(chunk, embedding);
        }

        return "PDF processed successfully!\n"
                + "Chunks: " + chunks.size()
                + "\nEmbeddings stored: " + vectorStore.size();
    }
}