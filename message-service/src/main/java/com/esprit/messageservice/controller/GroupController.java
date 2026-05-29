package com.esprit.messageservice.controller;

import com.esprit.messageservice.dto.request.GroupCreateRequestDTO;
import com.esprit.messageservice.dto.request.GroupMessageRequestDTO;
import com.esprit.messageservice.dto.request.MessageEditRequestDTO;
import com.esprit.messageservice.dto.response.GroupMessageResponseDTO;
import com.esprit.messageservice.dto.response.GroupResponseDTO;
import com.esprit.messageservice.security.JwtUtil;
import com.esprit.messageservice.service.GroupService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Groups")
@SecurityRequirement(name = "bearerAuth")
public class GroupController {

    private final GroupService groupService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<GroupResponseDTO> create(@Valid @RequestBody GroupCreateRequestDTO dto,
                                                    HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(dto, userId(req)));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponseDTO>> myGroups(HttpServletRequest req) {
        return ResponseEntity.ok(groupService.getMyGroups(userId(req)));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDTO> getGroup(@PathVariable Long groupId, HttpServletRequest req) {
        return ResponseEntity.ok(groupService.getGroup(groupId, userId(req)));
    }

    @PostMapping("/{groupId}/members/{targetUserId}")
    public ResponseEntity<GroupResponseDTO> addMember(@PathVariable Long groupId,
                                                       @PathVariable Long targetUserId,
                                                       HttpServletRequest req) {
        return ResponseEntity.ok(groupService.addMember(groupId, targetUserId, userId(req)));
    }

    @DeleteMapping("/{groupId}/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long groupId,
                                              @PathVariable Long targetUserId,
                                              HttpServletRequest req) {
        groupService.removeMember(groupId, targetUserId, userId(req));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId, HttpServletRequest req) {
        groupService.deleteGroup(groupId, userId(req));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/messages")
    public ResponseEntity<GroupMessageResponseDTO> sendMessage(@PathVariable Long groupId,
                                                                @Valid @RequestBody GroupMessageRequestDTO dto,
                                                                HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.sendGroupMessage(groupId, dto, userId(req)));
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<GroupMessageResponseDTO>> getMessages(@PathVariable Long groupId,
                                                                      HttpServletRequest req) {
        return ResponseEntity.ok(groupService.getGroupMessages(groupId, userId(req)));
    }

    @PatchMapping("/messages/{messageId}/edit")
    public ResponseEntity<GroupMessageResponseDTO> editMessage(@PathVariable Long messageId,
                                                                @Valid @RequestBody MessageEditRequestDTO dto,
                                                                HttpServletRequest req) {
        return ResponseEntity.ok(groupService.editGroupMessage(messageId, dto.getContenu(), userId(req)));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId, HttpServletRequest req) {
        groupService.deleteGroupMessage(messageId, userId(req));
        return ResponseEntity.noContent().build();
    }

    private Long userId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
