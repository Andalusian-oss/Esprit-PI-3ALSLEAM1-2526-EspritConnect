package com.esprit.postservice.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/posts")
@Tag(name = "File Upload")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    @Value("${upload.dir:./uploads}")
    private String uploadDir;
    
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
        ".jpg", ".jpeg", ".png", ".gif", ".webp",  // images
        ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"  // videos
    ));

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File is empty",
                    "message", "Please select a file to upload"
                ));
            }
            
            String filename = file.getOriginalFilename();
            String ext = getExtension(filename);
            
            if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File type not allowed",
                    "message", "File extension " + ext + " is not allowed. Allowed: JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV, AVI, MKV"
                ));
            }
            
            String uuid = UUID.randomUUID().toString();
            String newFilename = uuid + ext;
            Path dir = Paths.get(uploadDir, "photos");
            Files.createDirectories(dir);
            Path filePath = dir.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);
            
            log.info("File uploaded successfully: {} -> {}", filename, newFilename);
            return ResponseEntity.ok(Map.of("url", "/api/posts/uploads/photos/" + newFilename));
        } catch (IOException e) {
            log.error("IO error during file upload: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Upload failed",
                "message", "Failed to save file: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during file upload: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Upload failed",
                "message", "An unexpected error occurred: " + e.getMessage()
            ));
        }
    }

    private String getExtension(String name) {
        if (name == null) return ".bin";
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot) : ".bin";
    }
}
