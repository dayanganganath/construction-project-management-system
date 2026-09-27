package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.UserRepository;
import com.skyward.projectmanagement.security.JwtService;
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
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> request
    ) {
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response = new HashMap<>();

        if (
                username == null ||
                username.isBlank() ||
                password == null ||
                password.isBlank()
        ) {
            response.put("success", false);
            response.put(
                    "message",
                    "Username and password are required."
            );

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }

        Optional<User> userOptional =
                userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            response.put("success", false);
            response.put(
                    "message",
                    "Invalid username or password."
            );

            return ResponseEntity
                    .status(401)
                    .body(response);
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            response.put("success", false);
            response.put(
                    "message",
                    "Invalid username or password."
            );

            return ResponseEntity
                    .status(401)
                    .body(response);
        }

        if (Boolean.FALSE.equals(user.getActive())) {
            response.put("success", false);
            response.put(
                    "message",
                    "This user account is inactive."
            );

            return ResponseEntity
                    .status(403)
                    .body(response);
        }

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole()
        );

        response.put("success", true);
        response.put(
                "message",
                "Login successful."
        );
        response.put(
                "username",
                user.getUsername()
        );
        response.put(
                "role",
                user.getRole()
        );
        response.put(
                "token",
                token
        );

        return ResponseEntity.ok(response);
    }
}