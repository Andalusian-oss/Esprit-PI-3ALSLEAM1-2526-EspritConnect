package com.esprit.foyerservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*; import org.springframework.validation.FieldError;
import org.springframework.web.bind.*; import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime; import java.util.*;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String,Object>> handleNotFound(ResourceNotFoundException ex) { return buildError(HttpStatus.NOT_FOUND, ex.getMessage()); }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> handleIllegal(IllegalArgumentException ex) { return buildError(HttpStatus.BAD_REQUEST, ex.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String,String> fe = new HashMap<>();
        for (FieldError f : ex.getBindingResult().getFieldErrors()) fe.put(f.getField(), f.getDefaultMessage());
        return ResponseEntity.badRequest().body(Map.of("timestamp",LocalDateTime.now().toString(),"status",400,"error","Validation Failed","fieldErrors",fe));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected error occurred");
    }
    private ResponseEntity<Map<String,Object>> buildError(HttpStatus s, String msg) {
        return ResponseEntity.status(s).body(Map.of("timestamp",LocalDateTime.now().toString(),"status",s.value(),"error",s.getReasonPhrase(),"message",msg));
    }
}
