package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.BoqItem;
import com.skyward.projectmanagement.service.BoqItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boq-items")
@CrossOrigin(origins = "http://localhost:5173")
public class BoqItemController {

    private final BoqItemService boqItemService;

    public BoqItemController(BoqItemService boqItemService) {
        this.boqItemService = boqItemService;
    }

    @GetMapping
    public List<BoqItem> getAllBoqItems() {
        return boqItemService.getAllBoqItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoqItem> getBoqItemById(@PathVariable Long id) {
        return boqItemService.getBoqItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBoqItem(@RequestBody BoqItem boqItem) {
        try {
            return ResponseEntity.ok(boqItemService.createBoqItem(boqItem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBoqItem(
            @PathVariable Long id,
            @RequestBody BoqItem updatedBoqItem) {

        try {
            return ResponseEntity.ok(
                    boqItemService.updateBoqItem(id, updatedBoqItem)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoqItem(@PathVariable Long id) {

        if (boqItemService.getBoqItemById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boqItemService.deleteBoqItem(id);
        return ResponseEntity.noContent().build();
    }
}