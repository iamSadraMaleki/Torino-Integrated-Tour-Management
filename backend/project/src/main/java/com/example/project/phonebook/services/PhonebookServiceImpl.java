package com.example.project.phonebook.services;

import com.example.project.phonebook.dto.*;
import com.example.project.phonebook.model.PhonebookContact;
import com.example.project.phonebook.model.PhonebookJob;
import com.example.project.phonebook.repository.PhonebookContactRepository;
import com.example.project.phonebook.repository.PhonebookJobRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhonebookServiceImpl implements PhonebookService {

    private final PhonebookJobRepository jobRepository;
    private final PhonebookContactRepository contactRepository;
    private final UserRepository userRepository;

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر پیدا نشد"));
    }

    private String roleNames(User user) {
        return user.getRoles().stream()
                .map(r -> r.getName().replace("ROLE_", ""))
                .collect(Collectors.joining("، "));
    }

    // ============ سمتها و مشاغل ============

    @Override
    @Transactional(readOnly = true)
    public List<PhonebookJobResponse> getJobs(String username) {
        User user = getUserByUsername(username);
        return jobRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PhonebookJobResponse createJob(String username, PhonebookJobRequest request) {
        User user = getUserByUsername(username);
        PhonebookJob job = PhonebookJob.builder()
                .user(user)
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();
        return toJobResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public PhonebookJobResponse updateJob(String username, Long jobId, PhonebookJobRequest request) {
        User user = getUserByUsername(username);
        PhonebookJob job = jobRepository.findByIdAndUserId(jobId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سمت پیدا نشد"));
        job.setName(request.getName().trim());
        job.setDescription(request.getDescription());
        return toJobResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(String username, Long jobId) {
        User user = getUserByUsername(username);
        PhonebookJob job = jobRepository.findByIdAndUserId(jobId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سمت پیدا نشد"));
        // مخاطبینی که به این سمت لینک شده‌اند بدون سمت باقی می‌مانند
        List<PhonebookContact> linked = contactRepository.findByJobId(jobId);
        linked.forEach(c -> c.setJob(null));
        contactRepository.saveAll(linked);
        jobRepository.delete(job);
    }

    // ============ مخاطبین دفترچه ============

    @Override
    @Transactional(readOnly = true)
    public List<PhonebookContactResponse> getContacts(String username) {
        User user = getUserByUsername(username);
        return contactRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toContactResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PhonebookContactResponse createContact(String username, PhonebookContactRequest request) {
        User user = getUserByUsername(username);
        PhonebookContact contact = PhonebookContact.builder()
                .user(user)
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .job(resolveJob(user, request.getJobId()))
                .notes(request.getNotes())
                .build();
        return toContactResponse(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public PhonebookContactResponse updateContact(String username, Long contactId, PhonebookContactRequest request) {
        User user = getUserByUsername(username);
        PhonebookContact contact = contactRepository.findByIdAndUserId(contactId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "مخاطب پیدا نشد"));
        contact.setFullName(request.getFullName().trim());
        contact.setPhone(request.getPhone().trim());
        contact.setJob(resolveJob(user, request.getJobId()));
        contact.setNotes(request.getNotes());
        return toContactResponse(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public void deleteContact(String username, Long contactId) {
        User user = getUserByUsername(username);
        PhonebookContact contact = contactRepository.findByIdAndUserId(contactId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "مخاطب پیدا نشد"));
        contactRepository.delete(contact);
    }

    private PhonebookJob resolveJob(User user, Long jobId) {
        if (jobId == null) return null;
        return jobRepository.findByIdAndUserId(jobId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "سمت انتخاب‌شده پیدا نشد"));
    }

    // ============ مانیتورینگ سوپرادمین ============

    @Override
    @Transactional(readOnly = true)
    public List<PhonebookContactResponse> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toContactResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PhonebookJobResponse> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toJobResponse)
                .collect(Collectors.toList());
    }

    // ============ مپینگ ============

    private PhonebookJobResponse toJobResponse(PhonebookJob job) {
        return PhonebookJobResponse.builder()
                .id(job.getId())
                .name(job.getName())
                .description(job.getDescription())
                .contactCount(contactRepository.countByJobId(job.getId()))
                .createdAt(job.getCreatedAt())
                .ownerUsername(job.getUser() != null ? job.getUser().getUsername() : null)
                .build();
    }

    private PhonebookContactResponse toContactResponse(PhonebookContact contact) {
        User owner = contact.getUser();
        return PhonebookContactResponse.builder()
                .id(contact.getId())
                .fullName(contact.getFullName())
                .phone(contact.getPhone())
                .jobId(contact.getJob() != null ? contact.getJob().getId() : null)
                .jobName(contact.getJob() != null ? contact.getJob().getName() : null)
                .notes(contact.getNotes())
                .createdAt(contact.getCreatedAt())
                .ownerUsername(owner != null ? owner.getUsername() : null)
                .ownerCity(owner != null ? owner.getCity() : null)
                .ownerRoles(owner != null ? roleNames(owner) : null)
                .build();
    }
}
