package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.repository.ContractorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractorService {

    private final ContractorRepository contractorRepository;

    public ContractorService(
            ContractorRepository contractorRepository
    ) {
        this.contractorRepository = contractorRepository;
    }

    public List<Contractor> getAllContractors() {
        return contractorRepository.findAll();
    }

    public Contractor getContractorById(Long id) {
        return contractorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contractor not found.")
                );
    }

    public Contractor createContractor(
            Contractor contractor
    ) {
        if (contractor.getActive() == null) {
            contractor.setActive(true);
        }

        return contractorRepository.save(contractor);
    }

    public Contractor updateContractor(
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
                updatedContractor.getNicOrRegistrationNo()
        );

        contractor.setBankName(
                updatedContractor.getBankName()
        );

        contractor.setBankAccountName(
                updatedContractor.getBankAccountName()
        );

        contractor.setBankAccountNumber(
                updatedContractor.getBankAccountNumber()
        );

        contractor.setActive(
                updatedContractor.getActive()
        );

        return contractorRepository.save(contractor);
    }

    public void deleteContractor(Long id) {
        contractorRepository.deleteById(id);
    }
}