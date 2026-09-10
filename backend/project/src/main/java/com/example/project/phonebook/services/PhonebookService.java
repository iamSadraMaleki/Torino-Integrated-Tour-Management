package com.example.project.phonebook.services;

import com.example.project.phonebook.dto.*;

import java.util.List;

public interface PhonebookService {

    // ============ سمتها و مشاغل ============
    List<PhonebookJobResponse> getJobs(String username);

    PhonebookJobResponse createJob(String username, PhonebookJobRequest request);

    PhonebookJobResponse updateJob(String username, Long jobId, PhonebookJobRequest request);

    void deleteJob(String username, Long jobId);

    // ============ مخاطبین دفترچه ============
    List<PhonebookContactResponse> getContacts(String username);

    PhonebookContactResponse createContact(String username, PhonebookContactRequest request);

    PhonebookContactResponse updateContact(String username, Long contactId, PhonebookContactRequest request);

    void deleteContact(String username, Long contactId);

    // ============ مانیتورینگ سوپرادمین ============
    List<PhonebookContactResponse> getAllContacts();

    List<PhonebookJobResponse> getAllJobs();
}
