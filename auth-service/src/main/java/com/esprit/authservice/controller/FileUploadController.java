package com.esprit.authservice.controller;

import io.swagger.v3.oas.annotations.Operation;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "File Upload")
public class FileUploadController {

    private static final List<String> ALLOWED_DOC_EXTENSIONS = List.of(".pdf", ".doc", ".docx");

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
        }
        // Accept any kind of image (png, jpg, jpeg, gif, webp, svg, heic, avif, bmp, …)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only image files are accepted for avatars."));
        }
        // Prefer the original extension; fall back to one derived from the content type.
        String ext = getExtension(file.getOriginalFilename());
        if (".bin".equals(ext)) {
            ext = extensionFromContentType(contentType);
        }
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir, "avatars");
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        return ResponseEntity.ok(Map.of("url", "/api/auth/uploads/avatars/" + filename));
    }

    private String extensionFromContentType(String contentType) {
        String subtype = contentType.toLowerCase().substring("image/".length());
        switch (subtype) {
            case "jpeg":      return ".jpg";
            case "svg+xml":   return ".svg";
            case "x-icon":    return ".ico";
            default:          return "." + subtype.replaceAll("[^a-z0-9]", "");
        }
    }

    /**
     * Public endpoint — no authentication required.
     * Allows companies to upload their verification document before the account exists.
     * Only PDF, DOC, and DOCX files are accepted.
     */
    @Operation(summary = "Upload company verification document (public, pre-registration)")
    @PostMapping("/upload-company-doc")
    public ResponseEntity<Map<String, String>> uploadCompanyDoc(@RequestParam("file") MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_DOC_EXTENSIONS.contains(ext.toLowerCase())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only PDF, DOC, and DOCX files are accepted for verification documents."));
        }
        String filename = UUID.randomUUID() + ext;
        Path dir = Paths.get(uploadDir, "company-docs");
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));
        return ResponseEntity.ok(Map.of("url", "/api/auth/uploads/company-docs/" + filename));
    }

    private String getExtension(String name) {
        if (name == null) return ".bin";
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot) : ".bin";
    }
}
