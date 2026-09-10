package com.example.project.inbox.services;

import com.example.project.inbox.dto.InboxMessageResponse;
import com.example.project.inbox.dto.InboxSendRequest;
import com.example.project.inbox.dto.InboxStatsResponse;
import com.example.project.inbox.model.InboxMessage;
import com.example.project.inbox.model.InboxMessageType;
import com.example.project.inbox.repository.InboxMessageRepository;
import com.example.project.tour_chat.repository.ChatWarningRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InboxServiceImpl implements InboxService {

    public static final long SUSPENSION_THRESHOLD = 4;

    private final InboxMessageRepository inboxRepository;
    private final UserRepository userRepository;
    private final ChatWarningRepository chatWarningRepository;

    // ===================== سمت کاربر =====================

    @Override
    @Transactional(readOnly = true)
    public List<InboxMessageResponse> getMyInbox(String username) {
        User user = findUser(username);
        return inboxRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InboxStatsResponse getStats(String username) {
        User user = findUser(username);
        return InboxStatsResponse.builder()
                .total(inboxRepository.countByRecipientId(user.getId()))
                .unread(inboxRepository.countByRecipientIdAndReadFalse(user.getId()))
                .build();
    }

    @Override
    @Transactional
    public InboxMessageResponse markRead(String username, Long messageId) {
        User user = findUser(username);
        InboxMessage message = inboxRepository.findByIdAndRecipientId(messageId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پیام یافت نشد"));
        message.setRead(true);
        message = inboxRepository.save(message);
        return toResponse(message);
    }

    @Override
    @Transactional
    public int markAllRead(String username) {
        User user = findUser(username);
        List<InboxMessage> messages = inboxRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        int changed = 0;
        for (InboxMessage m : messages) {
            if (!m.isRead()) {
                m.setRead(true);
                changed++;
            }
        }
        if (changed > 0) {
            inboxRepository.saveAll(messages);
        }
        return changed;
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        User user = findUser(username);
        return inboxRepository.countByRecipientIdAndReadFalse(user.getId());
    }

    // ===================== سمت ادمین/سوپرادمین =====================

    @Override
    @Transactional
    public InboxMessageResponse sendPrivateMessage(String senderUsername, InboxSendRequest request) {
        User sender = findUser(senderUsername);
        String senderRole = "ADMIN";
        if (sender.getRoles().stream().anyMatch(r -> "ROLE_SUPERADMIN".equals(r.getName()))) {
            senderRole = "SUPERADMIN";
        }
        return sendToUser(senderUsername, senderRole, request.getRecipientUsername(),
                InboxMessageType.ADMIN, request.getTitle().trim(), request.getContent().trim(), null);
    }

    @Override
    @Transactional
    public InboxMessageResponse unsuspend(String adminUsername, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        if (user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "حساب این کاربر معلق نیست");
        }

        user.setEnabled(true);
        userRepository.save(user);

        // اخطارهای قبلی پاک می‌شوند تا چرخه «۴ اخطار → تعلیق» دوباره از صفر شروع شود
        chatWarningRepository.deleteByWarnedUserId(user.getId());

        log.info("User {} unsuspended by {}", user.getUsername(), adminUsername);
        return sendToUser("سیستم", "SYSTEM", user.getUsername(), InboxMessageType.UNSUSPENSION,
                "✅ حساب شما رفع تعلیق شد",
                "حساب شما توسط مدیریت از تعلیق خارج شد و دوباره فعال است. اخطارهای قبلی شما نیز بازنشانی شده است.",
                null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.example.project.users.dto.UserDto> getSuspendedUsers() {
        return userRepository.findByEnabledFalse().stream()
                .map(com.example.project.users.dto.UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    // ===================== تاریخچه ارسال (پنل ادمین) =====================

    @Override
    @Transactional(readOnly = true)
    public List<com.example.project.inbox.dto.InboxHistoryResponse> getSendHistory() {
        return inboxRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    // ===================== داخلی =====================

    @Override
    @Transactional
    public InboxMessageResponse sendToUser(String senderUsername, String senderRole,
                                           String recipientUsername, InboxMessageType type,
                                           String title, String content, Long referenceId) {
        User recipient = userRepository.findByUsername(recipientUsername.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر گیرنده یافت نشد"));

        InboxMessage message = InboxMessage.builder()
                .recipient(recipient)
                .senderUsername(senderUsername)
                .senderRole(senderRole)
                .type(type)
                .title(title)
                .content(content)
                .referenceId(referenceId)
                .build();
        message = inboxRepository.save(message);

        log.info("Inbox message {} (type {}) sent to {}", message.getId(), type, recipient.getUsername());
        return toResponse(message);
    }

    // ===================== helper ها =====================

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private String rolePersian(String role) {
        if (role == null) return "-";
        if ("SYSTEM".equals(role)) return "سیستم";
        if ("SUPERADMIN".equals(role)) return "سوپرادمین";
        if ("ROLE_SUPERADMIN".equals(role)) return "سوپرادمین";
        if ("ADMIN".equals(role) || "ROLE_ADMIN".equals(role)) return "ادمین";
        if ("ROLE_CEO".equals(role)) return "مدیر آژانس";
        if ("ROLE_USER".equals(role)) return "مسافر";
        return role;
    }

    private InboxMessageResponse toResponse(InboxMessage m) {
        return InboxMessageResponse.builder()
                .id(m.getId())
                .senderUsername(m.getSenderUsername())
                .senderRole(m.getSenderRole())
                .senderRolePersian(rolePersian(m.getSenderRole()))
                .type(m.getType())
                .title(m.getTitle())
                .content(m.getContent())
                .referenceId(m.getReferenceId())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private com.example.project.inbox.dto.InboxHistoryResponse toHistoryResponse(InboxMessage m) {
        User recipient = m.getRecipient();
        String recipientRole = "";
        if (recipient.getRoles() != null) {
            recipientRole = recipient.getRoles().stream()
                    .findFirst()
                    .map(r -> r.getName())
                    .orElse("");
        }
        return com.example.project.inbox.dto.InboxHistoryResponse.builder()
                .id(m.getId())
                .recipientUsername(recipient.getUsername())
                .recipientRole(recipientRole)
                .recipientRolePersian(rolePersian(recipientRole))
                .senderUsername(m.getSenderUsername())
                .senderRole(m.getSenderRole())
                .senderRolePersian(rolePersian(m.getSenderRole()))
                .type(m.getType())
                .title(m.getTitle())
                .content(m.getContent())
                .referenceId(m.getReferenceId())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
