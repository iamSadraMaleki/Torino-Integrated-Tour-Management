package com.example.project.profile.logmanagment;

import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginLogService {

    private final LoginLogRepository loginLogRepository;
    private final UserRepository userRepository;

    /**
     * ثبت اکشن (LOGIN یا LOGOUT یا چیزای دیگه) به همراه IP
     */
    public void logAction(User user, String action, String ip) {
        LoginLog log = LoginLog.builder()
                .user(user)
                .action(action)
                .timestamp(LocalDateTime.now())
                .ipAddress(ip)
                .build();
        loginLogRepository.save(log);
    }

    /**
     * گرفتن 5 لاگ آخر کاربر لاگین‌شده
     */
    public List<LoginLog> getLast5LogsForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return loginLogRepository.findTop5ByUserIdOrderByTimestampDesc(user.getId());
    }

    /**
     * ثبت ساده لاگ بدون IP
     */
    public void saveLog(User user, String action) {
        LoginLog log = new LoginLog();
        log.setUser(user);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        loginLogRepository.save(log);
    }
}
