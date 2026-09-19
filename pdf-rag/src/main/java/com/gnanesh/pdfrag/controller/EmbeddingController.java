package com.gnanesh.pdfrag.controller;

import com.gnanesh.pdfrag.service.EmbeddingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/embedding")
public class EmbeddingController {

    private final EmbeddingService embeddingService;

    public EmbeddingController(EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
    }

    @GetMapping("/test")
    public String testEmbedding() {

        String text = "What is an operating system?";

        float[] embedding = embeddingService.generateEmbedding(text);

        return "Embedding generated successfully!\n"
                + "Dimensions: " + embedding.length
                + "\nFirst value: " + embedding[0];
    }
}