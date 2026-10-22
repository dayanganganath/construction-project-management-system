package com.skyward.projectmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateClientProfileRequest {

    private String fullName;

    private String email;

    private String phone;
}