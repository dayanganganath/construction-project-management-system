package com.skyward.projectmanagement.config;

import com.skyward.projectmanagement.controller.ProjectController;
import com.skyward.projectmanagement.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProjectController.class, properties = {
        "APP_ADMIN_USERNAME=admin", "APP_ADMIN_PASSWORD=test-admin-password",
        "APP_VIEWER_USERNAME=viewer", "APP_VIEWER_PASSWORD=test-viewer-password"
})
@Import(SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ProjectService service;

    @Test
    void unauthenticatedRequestsAreRejected() throws Exception {
        mvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
    }

    @Test
    void viewerCanReadButCannotCreateProjects() throws Exception {
        when(service.getAllProjects()).thenReturn(List.of());

        mvc.perform(get("/api/projects").header(HttpHeaders.AUTHORIZATION, basic("viewer", "test-viewer-password")))
                .andExpect(status().isOk());
        mvc.perform(post("/api/projects").header(HttpHeaders.AUTHORIZATION, basic("viewer", "test-viewer-password")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessWriteEndpoint() throws Exception {
        mvc.perform(post("/api/projects")
                        .header(HttpHeaders.AUTHORIZATION, basic("admin", "test-admin-password"))
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk());
    }

    private String basic(String username, String password) {
        String credentials = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }
}
