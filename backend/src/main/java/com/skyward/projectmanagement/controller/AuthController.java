package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> request
    ) {
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response = new HashMap<>();

        if (username == null || password == null) {
            response.put("success", false);
            response.put("message", "Username and password are required.");

            return ResponseEntity.badRequest().body(response);
        }

        Optional<User> userOptional =
                userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid username or password.");

            return ResponseEntity.status(401).body(response);
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("success", false);
            response.put("message", "Invalid username or password.");

            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("message", "Login successful.");
        response.put("username", user.getUsername());

        return ResponseEntity.ok(response);
    }
}