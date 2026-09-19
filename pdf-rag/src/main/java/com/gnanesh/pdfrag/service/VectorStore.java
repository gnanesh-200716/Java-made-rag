package com.gnanesh.pdfrag.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class VectorStore {

    private final List<String> chunks = new ArrayList<>();
    private final List<float[]> embeddings = new ArrayList<>();

    public void add(String chunk, float[] embedding) {
        chunks.add(chunk);
        embeddings.add(embedding);
    }

    public int size() {
        return chunks.size();
    }

    public String search(float[] queryEmbedding) {

        List<Result> results = new ArrayList<>();

        for (int i = 0; i < embeddings.size(); i++) {

            double score = cosineSimilarity(
                    queryEmbedding,
                    embeddings.get(i)
            );

            results.add(new Result(chunks.get(i), score));
        }

        results.sort(
                Comparator.comparingDouble(Result::score).reversed()
        );

        int topK = Math.min(5, results.size());

        StringBuilder context = new StringBuilder();

        for (int i = 0; i < topK; i++) {

            context.append("\n--- CHUNK ")
                    .append(i + 1)
                    .append(" ---\n");

            context.append(results.get(i).chunk());
            context.append("\n");
        }

        return context.toString();
    }

    private double cosineSimilarity(float[] a, float[] b) {

        double dot = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < a.length; i++) {

            dot += a[i] * b[i];

            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dot /
                (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record Result(String chunk, double score) {
    }
}