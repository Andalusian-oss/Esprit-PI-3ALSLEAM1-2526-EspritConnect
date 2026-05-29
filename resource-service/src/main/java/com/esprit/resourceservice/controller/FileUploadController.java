package com.esprit.resourceservice.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "File Upload")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir, "resources");
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        return ResponseEntity.ok(Map.of("url", "/api/resources/files/" + filename));
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<byte[]> serveFile(@PathVariable String filename) throws IOException {
        Path file = Paths.get(uploadDir, "resources", filename);
        if (!Files.exists(file)) return ResponseEntity.notFound().build();
        byte[] bytes = Files.readAllBytes(file);
        String contentType = Files.probeContentType(file);
        return ResponseEntity.ok()
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(bytes);
    }

    private String getExtension(String name) {
        if (name == null) return ".bin";
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot) : ".bin";
    }
}
