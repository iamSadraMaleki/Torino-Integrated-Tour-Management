package com.example.project.tour_chat.services;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.repository.TourRepository;
import com.example.project.inbox.model.InboxMessageType;
import com.example.project.inbox.services.InboxService;
import com.example.project.tour_chat.dto.*;
import com.example.project.tour_chat.model.ChatWarning;
import com.example.project.tour_chat.model.TourChatMessage;
import com.example.project.tour_chat.model.TourConversation;
import com.example.project.tour_chat.repository.ChatWarningRepository;
import com.example.project.tour_chat.repository.TourChatMessageRepository;
import com.example.project.tour_chat.repository.TourConversationRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourChatServiceImpl implements TourChatService {

    private final TourConversationRepository conversationRepository;
    private final TourChatMessageRepository messageRepository;
    private final ChatWarningRepository warningRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final InboxService inboxService;

    // ===================== شروع / لیست =====================

    @Override
    @Transactional
    public TourConversationResponse startConversation(String username, Long tourId) {
        User passenger = findUser(username);
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "تور یافت نشد"));

        User ceo = tour.getCreatedBy();

        // گفتگوی قبلی برای همین (تور، مسافر) را برگردان
        TourConversation conversation = conversationRepository
                .findByTourIdAndPassengerId(tour.getId(), passenger.getId())
                .orElseGet(() -> {
                    TourConversation created = TourConversation.builder()
                            .tour(tour)
                            .passenger(passenger)
                            .tourCeo(ceo)
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    return conversationRepository.save(created);
                });

        log.info("Tour chat conversation {} (tour {}) for passenger {}", conversation.getId(), tourId, username);
        return toResponse(conversation, username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourConversationResponse> getConversations(String username) {
        User user = findUser(username);
        List<TourConversation> conversations;
        if (isCeo(user)) {
            conversations = conversationRepository.findByTourCeoIdOrderByLastMessageAtDesc(user.getId());
        } else {
            conversations = conversationRepository.findByPassengerIdOrderByLastMessageAtDesc(user.getId());
        }
        return conversations.stream()
                .map(c -> toResponse(c, username))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TourConversationResponse getConversation(String username, Long conversationId) {
        TourConversation conversation = findAccessibleConversation(username, conversationId);
        return toResponse(conversation, username);
    }

    @Override
    @Transactional
    public List<TourChatMessageResponse> getMessages(String username, Long conversationId) {
        TourConversation conversation = findAccessibleConversation(username, conversationId);
        User viewer = findUser(username);

        // خواندن گفتگو = علامت‌گذاری به‌عنوان خوانده‌شده (برای شمارنده اینباکس)
        boolean viewerIsPassenger = conversation.getPassenger().getId().equals(viewer.getId());
        if (viewerIsPassenger) {
            conversation.setPassengerLastReadAt(LocalDateTime.now());
        } else {
            conversation.setCeoLastReadAt(LocalDateTime.now());
        }
        conversationRepository.save(conversation);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourChatMessageResponse sendMessage(String username, Long conversationId, TourChatSendRequest request) {
        TourConversation conversation = findAccessibleConversation(username, conversationId);
        User sender = findUser(username);
        String role = senderRole(sender);

        TourChatMessage message = TourChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .senderName(sender.getUsername())
                .senderRole(role)
                .content(request.getContent().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .build();
        message = messageRepository.save(message);

        // به‌روزرسانی زمان آخرین پیام برای مرتب‌سازی لیست
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Tour chat message {} added to conversation {} by {}", message.getId(), conversationId, username);
        return toMessageResponse(message);
    }

    // ===================== ویرایش / حذف =====================

    @Override
    @Transactional
    public TourChatMessageResponse editMessage(String username, Long messageId, TourChatEditRequest request) {
        TourChatMessage message = findOwnMessage(username, messageId);
        message.setContent(request.getContent().trim());
        message.setAttachmentUrl(request.getAttachmentUrl());
        message.setEdited(true);
        message = messageRepository.save(message);

        // به‌روزرسانی زمان آخرین پیام (برای نمایش در لیست)
        TourConversation conversation = message.getConversation();
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Tour chat message {} edited by {}", messageId, username);
        return toMessageResponse(message);
    }

    @Override
    @Transactional
    public void deleteMessage(String username, Long messageId) {
        TourChatMessage message = findOwnMessage(username, messageId);
        // حذف نرم — محتوا برای مانیتورینگ امنیتی حفظ می‌شود
        message.setDeleted(true);
        messageRepository.save(message);
        log.info("Tour chat message {} soft-deleted by {}", messageId, username);
    }

    // ===================== اخطار (سمت کاربر) =====================

    @Override
    @Transactional(readOnly = true)
    public List<ChatWarningResponse> getMyWarnings(String username) {
        User user = findUser(username);
        return warningRepository.findByWarnedUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toWarningResponse)
                .collect(Collectors.toList());
    }

    // ===================== سمت سوپرادمین/ادمین =====================

    @Override
    @Transactional(readOnly = true)
    public List<AdminTourChatMessageResponse> getAdminMonitorMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toAdminMonitorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatWarningResponse warnMessage(String adminUsername, ChatWarningRequest request) {
        TourChatMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پیام یافت نشد"));

        User warnedUser = message.getSender();
        ChatWarning warning = ChatWarning.builder()
                .message(message)
                .warnedUser(warnedUser)
                .reason(request.getReason().trim())
                .issuedBy(adminUsername)
                .build();
        warning = warningRepository.save(warning);

        long warningCount = warningRepository.countByWarnedUserId(warnedUser.getId());

        // ۱) اطلاع‌رسانی اخطار به اینباکس کاربر
        inboxService.sendToUser("سیستم", "SYSTEM", warnedUser.getUsername(), InboxMessageType.WARNING,
                "⚠️ اخطار دریافت کردید",
                "شما اخطار شماره " + warningCount + " از ۴ دریافت کردید. دلیل: «" + request.getReason().trim()
                        + "». در صورت دریافت ۴ اخطار، حساب شما تعلیق می‌شود.",
                warning.getId());

        // ۲) تعلیق خودکار بعد از ۴ اخطار
        if (warningCount >= 4 && warnedUser.isEnabled()) {
            warnedUser.setEnabled(false);
            userRepository.save(warnedUser);
            inboxService.sendToUser("سیستم", "SYSTEM", warnedUser.getUsername(), InboxMessageType.SUSPENSION,
                    "🚫 حساب شما تعلیق شد",
                    "به دلیل دریافت " + warningCount + " اخطار برای پیام‌های نامرتبط، حساب شما تا زمان بررسی توسط مدیریت تعلیق شد. "
                            + "برای رفع تعلیق با پشتیبانی تماس بگیرید.",
                    warning.getId());
            log.warn("User {} suspended automatically after {} warnings (by {})",
                    warnedUser.getUsername(), warningCount, adminUsername);
        }

        log.info("Warning {} issued by {} for message {} (user {})",
                warning.getId(), adminUsername, message.getId(), warnedUser.getUsername());
        return toWarningResponse(warning);
    }

    // ===================== helper ها =====================

    private TourChatMessage findOwnMessage(String username, Long messageId) {
        User user = findUser(username);
        TourChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "پیام یافت نشد"));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما فقط می‌توانید پیام‌های خود را ویرایش/حذف کنید");
        }
        if (message.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این پیام قبلاً حذف شده است");
        }
        return message;
    }

    private TourConversation findAccessibleConversation(String username, Long conversationId) {
        User user = findUser(username);
        TourConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "گفتگو یافت نشد"));

        boolean isPassenger = conversation.getPassenger().getId().equals(user.getId());
        boolean isTourCeo = conversation.getTourCeo().getId().equals(user.getId());

        if (!isPassenger && !isTourCeo) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما به این گفتگو دسترسی ندارید");
        }
        return conversation;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private boolean isCeo(User user) {
        return user.getRoles().stream()
                .anyMatch(r -> "ROLE_CEO".equals(r.getName()));
    }

    private String senderRole(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet());
        if (roles.contains("ROLE_CEO")) {
            return "AGENCY";
        }
        return "USER";
    }

    private String senderRolePersian(String role) {
        return "AGENCY".equals(role) ? "آژانس" : "مسافر";
    }

    /** طرف مقابل در گفتگو (گیرنده پیام) */
    private User receiverOf(TourChatMessage m) {
        TourConversation c = m.getConversation();
        boolean senderIsPassenger = c.getPassenger().getId().equals(m.getSender().getId());
        return senderIsPassenger ? c.getTourCeo() : c.getPassenger();
    }

    private TourConversationResponse toResponse(TourConversation c, String viewerUsername) {
        Tour tour = c.getTour();
        List<TourChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());

        LocalDateTime lastAt = c.getLastMessageAt() != null ? c.getLastMessageAt() : c.getCreatedAt();
        String lastPreview = "";
        if (!messages.isEmpty()) {
            TourChatMessage last = messages.get(messages.size() - 1);
            if (last.isDeleted()) {
                lastPreview = "🗑 این پیام حذف شده است";
            } else {
                String raw = last.getContent();
                lastPreview = raw.length() > 60 ? raw.substring(0, 60) + "…" : raw;
            }
        }

        // شمارنده پیام‌های نخوانده برای بیننده (اینباکس)
        long unreadCount = 0;
        try {
            User viewer = findUser(viewerUsername);
            boolean viewerIsPassenger = c.getPassenger().getId().equals(viewer.getId());
            LocalDateTime lastRead = viewerIsPassenger ? c.getPassengerLastReadAt() : c.getCeoLastReadAt();
            if (lastRead != null) {
                unreadCount = messageRepository.countByConversationIdAndCreatedAtAfter(c.getId(), lastRead);
            } else if (!messages.isEmpty()) {
                unreadCount = messages.size();
            }
        } catch (Exception ignored) {
            // خطا در محاسبه unread نباید لیست گفتگوها را از کار بیندازد
        }

        return TourConversationResponse.builder()
                .id(c.getId())
                .tourId(tour.getId())
                .tourName(tour.getBaseTour().getTourName())
                .tourCode(tour.getBaseTour().getTourCode())
                .departureDate(tour.getDepartureDate())
                .returnDate(tour.getReturnDate())
                .passengerUsername(c.getPassenger().getUsername())
                .passengerMobile(c.getPassenger().getMobile())
                .ceoUsername(c.getTourCeo().getUsername())
                .lastMessageAt(lastAt)
                .lastMessagePreview(lastPreview)
                .messageCount(messages.size())
                .unreadCount(unreadCount)
                .build();
    }

    private TourChatMessageResponse toMessageResponse(TourChatMessage m) {
        boolean agency = "AGENCY".equals(m.getSenderRole());
        User receiver = receiverOf(m);
        String receiverRole = "AGENCY".equals(m.getSenderRole()) ? "USER" : "AGENCY";

        return TourChatMessageResponse.builder()
                .id(m.getId())
                .content(m.getContent())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSenderName())
                .senderRole(m.getSenderRole())
                .senderRolePersian(senderRolePersian(m.getSenderRole()))
                .isAgency(agency)
                .receiverId(receiver.getId())
                .receiverUsername(receiver.getUsername())
                .receiverRole(receiverRole)
                .receiverRolePersian(senderRolePersian(receiverRole))
                .attachmentUrl(m.getAttachmentUrl())
                .edited(m.isEdited())
                .deleted(m.isDeleted())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private AdminTourChatMessageResponse toAdminMonitorResponse(TourChatMessage m) {
        TourConversation c = m.getConversation();
        Tour tour = c.getTour();
        User receiver = receiverOf(m);
        String receiverRole = "AGENCY".equals(m.getSenderRole()) ? "USER" : "AGENCY";

        List<ChatWarning> warnings = warningRepository.findByMessageIdOrderByCreatedAtDesc(m.getId());
        long warningCount = warnings.size();

        return AdminTourChatMessageResponse.builder()
                .id(m.getId())
                .conversationId(c.getId())
                .tourId(tour.getId())
                .tourName(tour.getBaseTour().getTourName())
                .tourCode(tour.getBaseTour().getTourCode())
                .content(m.getContent())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSenderName())
                .senderRole(m.getSenderRole())
                .senderRolePersian(senderRolePersian(m.getSenderRole()))
                .receiverId(receiver.getId())
                .receiverUsername(receiver.getUsername())
                .receiverRole(receiverRole)
                .receiverRolePersian(senderRolePersian(receiverRole))
                .attachmentUrl(m.getAttachmentUrl())
                .edited(m.isEdited())
                .deleted(m.isDeleted())
                .warnings(warnings.stream().map(this::toWarningResponse).collect(Collectors.toList()))
                .warningCount(warningCount)
                .createdAt(m.getCreatedAt())
                .build();
    }

    private ChatWarningResponse toWarningResponse(ChatWarning w) {
        User warned = w.getWarnedUser();
        String warnedRole = isCeo(warned) ? "AGENCY" : "USER";
        return ChatWarningResponse.builder()
                .id(w.getId())
                .messageId(w.getMessage().getId())
                .warnedUserId(warned.getId())
                .warnedUsername(warned.getUsername())
                .warnedRole(warnedRole)
                .warnedRolePersian(senderRolePersian(warnedRole))
                .reason(w.getReason())
                .issuedBy(w.getIssuedBy())
                .createdAt(w.getCreatedAt())
                .build();
    }
}
