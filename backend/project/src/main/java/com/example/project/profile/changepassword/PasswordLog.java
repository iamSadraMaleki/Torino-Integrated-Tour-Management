package com.example.project.profile.changepassword;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_log")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PasswordLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(nullable = false)
    private String oldPassword; // هش قدیمی

    @Column(nullable = false)
    private String newPassword; // هش جدید

    private LocalDateTime changedAt;
}

