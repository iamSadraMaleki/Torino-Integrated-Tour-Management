package com.example.project.profile.logmanagment;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // هر لاگ مربوط به یک کاربر
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // LOGIN یا LOGOUT

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String ipAddress; // اختیاری
}
