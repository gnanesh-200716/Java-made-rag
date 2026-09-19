package com.gnanesh.pdfrag.controller;

import com.gnanesh.pdfrag.service.EmbeddingService;
import com.gnanesh.pdfrag.service.VectorStore;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;

    public SearchController(
            EmbeddingService embeddingService,
            VectorStore vectorStore) {

        this.embeddingService = embeddingService;
        this.vectorStore = vectorStore;
    }

    @GetMapping
    public String search(@RequestParam String question) {

        float[] queryEmbedding =
                embeddingService.generateEmbedding(question);

        return vectorStore.search(queryEmbedding);
    }
}