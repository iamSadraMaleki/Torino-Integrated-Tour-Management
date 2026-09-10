package com.example.project.ceo_policy.services;

public class DuplicatePolicyNameException extends RuntimeException {
    public DuplicatePolicyNameException(String message) {
        super(message);
    }
}
