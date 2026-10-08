package com.skyward.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProjectAssignmentResponse {

    private Long assignmentId;

    private Long userId;
    private String username;
    private String role;

    private Long projectId;
    private String projectName;
    private String location;
    private String status;
}