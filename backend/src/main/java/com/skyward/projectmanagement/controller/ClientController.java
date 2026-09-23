package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.Client;
import com.skyward.projectmanagement.service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:5173")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientService.getClientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientService.createClient(client);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        if (clientService.getClientById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
        @PutMapping("/{id}")
public ResponseEntity<Client> updateClient(
        @PathVariable Long id,
        @RequestBody Client updatedClient) {

    try {
        Client client = clientService.updateClient(id, updatedClient);
        return ResponseEntity.ok(client);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
    
}