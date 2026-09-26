package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.UserResponse;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.skyward.projectmanagement.dto.UserResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
public List<UserResponse> getAllUsers() {
    return userService.getAllUsers();
}
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody User user
    ) {
        try {
            return ResponseEntity.ok(
                    userService.createUser(user)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User user
    ) {
        try {
            return ResponseEntity.ok(
                    userService.updateUser(id, user)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id
    ) {
        userService.deleteUser(id);

        return ResponseEntity.ok(
                Map.of("message", "User deleted successfully.")
        );
    }
}