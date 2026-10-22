package com.skyward.projectmanagement.dto;

public record ClientProfileDto(

        Long id,

        String username,

        String fullName,

        String email,

        String phone,

        String role,

        Boolean photoAvailable

) {
}