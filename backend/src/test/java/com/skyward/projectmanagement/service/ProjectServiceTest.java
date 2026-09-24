package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Client;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ClientRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProjectServiceTest {

    private final ProjectRepository projects = mock(ProjectRepository.class);
    private final ClientRepository clients = mock(ClientRepository.class);
    private final ProjectService service = new ProjectService(projects, clients);

    @Test
    void createProjectLinksAnExistingClientBeforeSaving() {
        Client reference = new Client();
        reference.setId(7L);
        Client storedClient = new Client();
        storedClient.setId(7L);
        storedClient.setName("Test Client");
        Project project = new Project();
        project.setProjectName("Test Project");
        project.setClient(reference);

        when(clients.findById(7L)).thenReturn(Optional.of(storedClient));
        when(projects.save(project)).thenReturn(project);

        Project saved = service.createProject(project);

        assertSame(storedClient, saved.getClient());
        verify(projects).save(project);
    }

    @Test
    void createProjectRejectsAnUnknownClient() {
        Client reference = new Client();
        reference.setId(99L);
        Project project = new Project();
        project.setClient(reference);
        when(clients.findById(99L)).thenReturn(Optional.empty());

        RuntimeException error = assertThrows(RuntimeException.class, () -> service.createProject(project));

        assertEquals("Client not found", error.getMessage());
    }
}
