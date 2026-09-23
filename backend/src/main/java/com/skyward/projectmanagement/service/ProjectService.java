package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Client;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ClientRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ClientRepository clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {

        if (project.getClient() == null || project.getClient().getId() == null) {
            throw new RuntimeException("Client ID is required");
        }

        Client client = clientRepository.findById(project.getClient().getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        project.setClient(client);

        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project updatedProject) {

        return projectRepository.findById(id)
                .map(project -> {

                    project.setProjectName(updatedProject.getProjectName());
                    project.setLocation(updatedProject.getLocation());
                    project.setDescription(updatedProject.getDescription());
                    project.setStartDate(updatedProject.getStartDate());
                    project.setEndDate(updatedProject.getEndDate());
                    project.setStatus(updatedProject.getStatus());
                    project.setBudget(updatedProject.getBudget());

                    if (updatedProject.getClient() != null
                            && updatedProject.getClient().getId() != null) {

                        Client client = clientRepository
                                .findById(updatedProject.getClient().getId())
                                .orElseThrow(() -> new RuntimeException("Client not found"));

                        project.setClient(client);
                    }

                    return projectRepository.save(project);
                })
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}