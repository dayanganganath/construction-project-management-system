package com.skyward.projectmanagement.dto;

import java.time.LocalDateTime;

public record ActivationInviteResponse(

        Long userId,

        String username,

        String email,

        String token,

        LocalDateTime expiresAt

) {
}