package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.BoqItem;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.BoqItemRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoqItemService {

    private final BoqItemRepository boqItemRepository;
    private final ProjectRepository projectRepository;

    public BoqItemService(BoqItemRepository boqItemRepository,
                          ProjectRepository projectRepository) {
        this.boqItemRepository = boqItemRepository;
        this.projectRepository = projectRepository;
    }

    public List<BoqItem> getAllBoqItems() {
        return boqItemRepository.findAll();
    }

    public Optional<BoqItem> getBoqItemById(Long id) {
        return boqItemRepository.findById(id);
    }

    public BoqItem createBoqItem(BoqItem boqItem) {

        if (boqItem.getProject() == null || boqItem.getProject().getId() == null) {
            throw new RuntimeException("Project ID is required");
        }

        Project project = projectRepository
                .findById(boqItem.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boqItem.setProject(project);

        return boqItemRepository.save(boqItem);
    }

    public BoqItem updateBoqItem(Long id, BoqItem updatedBoqItem) {

        return boqItemRepository.findById(id)
                .map(boqItem -> {

                    boqItem.setItemDescription(updatedBoqItem.getItemDescription());
                    boqItem.setSpecification(updatedBoqItem.getSpecification());
                    boqItem.setQuantity(updatedBoqItem.getQuantity());
                    boqItem.setUnit(updatedBoqItem.getUnit());
                    boqItem.setRate(updatedBoqItem.getRate());

                    if (updatedBoqItem.getProject() != null
                            && updatedBoqItem.getProject().getId() != null) {

                        Project project = projectRepository
                                .findById(updatedBoqItem.getProject().getId())
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                        boqItem.setProject(project);
                    }

                    return boqItemRepository.save(boqItem);
                })
                .orElseThrow(() -> new RuntimeException("BOQ item not found"));
    }

    public void deleteBoqItem(Long id) {
        boqItemRepository.deleteById(id);
    }
}