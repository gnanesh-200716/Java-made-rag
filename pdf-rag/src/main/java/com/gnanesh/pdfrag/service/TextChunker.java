package com.gnanesh.pdfrag.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TextChunker {

    public List<String> chunkText(String text) {

        int chunkSize = 1000;
        int overlap = 200;

        List<String> chunks = new ArrayList<>();

        int start = 0;

        while (start < text.length()) {

            int end = Math.min(start + chunkSize, text.length());

            chunks.add(text.substring(start, end));

            if (end == text.length()) {
                break;
            }

            start = end - overlap;
        }

        return chunks;
    }
}