package com.skyward.projectmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivateAccountRequest {

    private String token;

    private String newPassword;

    private String confirmPassword;
}