package com.gnanesh.pdfrag.controller;

import com.gnanesh.pdfrag.service.RagService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@RequestMapping("/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @GetMapping
    public String ask(@RequestParam String question) {

        return ragService.ask(question);
    }
}