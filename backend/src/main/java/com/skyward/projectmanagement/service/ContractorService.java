package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.User;

import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContractorService {

    private final ContractorRepository
            contractorRepository;

    private final UserRepository
            userRepository;

    public ContractorService(
            ContractorRepository contractorRepository,
            UserRepository userRepository
    ) {
        this.contractorRepository =
                contractorRepository;

        this.userRepository =
                userRepository;
    }

    public List<Contractor>
    getAllContractors() {

        return contractorRepository
                .findAll();
    }

    public Contractor
    getContractorById(
            Long id
    ) {

        return contractorRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Contractor not found."
                                )
                );
    }

    public Contractor
    createContractor(
            Contractor contractor
    ) {

        if (
                contractor.getActive() == null
        ) {
            contractor.setActive(true);
        }

        contractor.setUser(null);

        return contractorRepository
                .save(contractor);
    }

    public Contractor
    updateContractor(
            Long id,
            Contractor updatedContractor
    ) {

        Contractor contractor =
                getContractorById(id);

        contractor.setName(
                updatedContractor.getName()
        );

        contractor.setType(
                updatedContractor.getType()
        );

        contractor.setTradeType(
                updatedContractor.getTradeType()
        );

        contractor.setPhone(
                updatedContractor.getPhone()
        );

        contractor.setAddress(
                updatedContractor.getAddress()
        );

        contractor.setNicOrRegistrationNo(
                updatedContractor
                        .getNicOrRegistrationNo()
        );

        contractor.setBankName(
                updatedContractor.getBankName()
        );

        contractor.setBankAccountName(
                updatedContractor
                        .getBankAccountName()
        );

        contractor.setBankAccountNumber(
                updatedContractor
                        .getBankAccountNumber()
        );

        if (
                updatedContractor.getActive()
                        != null
        ) {
            contractor.setActive(
                    updatedContractor.getActive()
            );
        }

        return contractorRepository
                .save(contractor);
    }

    @Transactional
    public Map<String, Object>
    assignUser(
            Long contractorId,
            Long userId
    ) {

        Contractor contractor =
                getContractorById(
                        contractorId
                );

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found."
                                        )
                        );

        if (
                !"CONTRACTOR"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
        ) {
            throw new RuntimeException(
                    "Selected user must have CONTRACTOR role."
            );
        }

        if (
                !Boolean.TRUE.equals(
                        user.getActive()
                )
        ) {
            throw new RuntimeException(
                    "Selected user account is inactive."
            );
        }

        if (
                contractorRepository
                        .existsByUserId(userId)
                &&
                (
                        contractor.getUser() == null
                        ||
                        !contractor
                                .getUser()
                                .getId()
                                .equals(userId)
                )
        ) {
            throw new RuntimeException(
                    "This user is already linked to another contractor."
            );
        }

        contractor.setUser(user);

        contractorRepository
                .save(contractor);

        return buildAccountResponse(
                contractor
        );
    }

    @Transactional
    public Map<String, Object>
    removeUser(
            Long contractorId
    ) {

        Contractor contractor =
                getContractorById(
                        contractorId
                );

        contractor.setUser(null);

        contractorRepository
                .save(contractor);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "Contractor login account removed."
        );

        response.put(
                "contractorId",
                contractor.getId()
        );

        return response;
    }

    public Map<String, Object>
    getLinkedAccount(
            Long contractorId
    ) {

        Contractor contractor =
                getContractorById(
                        contractorId
                );

        return buildAccountResponse(
                contractor
        );
    }

    private Map<String, Object>
    buildAccountResponse(
            Contractor contractor
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "contractorId",
                contractor.getId()
        );

        response.put(
                "contractorName",
                contractor.getName()
        );

        boolean linked =
                contractor.getUser() != null;

        response.put(
                "linked",
                linked
        );

        if (linked) {

            response.put(
                    "userId",
                    contractor
                            .getUser()
                            .getId()
            );

            response.put(
                    "username",
                    contractor
                            .getUser()
                            .getUsername()
            );

            response.put(
                    "role",
                    contractor
                            .getUser()
                            .getRole()
            );

            response.put(
                    "userActive",
                    contractor
                            .getUser()
                            .getActive()
            );
        }

        return response;
    }

    public void deleteContractor(
            Long id
    ) {

        contractorRepository
                .deleteById(id);
    }
}