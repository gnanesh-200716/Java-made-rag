package com.gnanesh.pdfrag.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class RagService {

    private final ChatClient chatClient;
    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;

    public RagService(
            ChatClient.Builder chatClientBuilder,
            EmbeddingService embeddingService,
            VectorStore vectorStore) {

        this.chatClient = chatClientBuilder.build();
        this.embeddingService = embeddingService;
        this.vectorStore = vectorStore;
    }

    public String ask(String question) {

        float[] queryEmbedding =
                embeddingService.generateEmbedding(question);

        String context =
                vectorStore.search(queryEmbedding);

        String prompt = """
                You are a PDF question-answering assistant.

                Answer the user's question using the PDF context
                provided below.

                Use the information from the context to construct
                a clear and concise answer.

                Do not use outside knowledge.

                If the answer cannot be found in the provided
                PDF context, say:
                "The information is not available in the PDF."

                PDF CONTEXT:
                %s

                USER QUESTION:
                %s
                """.formatted(context, question);

        return chatClient
                .prompt(prompt)
                .call()
                .content();
    }
}