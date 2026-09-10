package com.example.project.ticket.services;

import com.example.project.ticket.dto.*;
import com.example.project.ticket.model.Ticket;
import com.example.project.ticket.model.TicketMessage;
import com.example.project.ticket.model.TicketPriority;
import com.example.project.ticket.model.TicketStatus;
import com.example.project.ticket.repository.TicketMessageRepository;
import com.example.project.ticket.repository.TicketRepository;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final UserRepository userRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    // ===================== کاربر و مدیر آژانس =====================

    @Override
    @Transactional
    public TicketResponse create(String username, TicketCreateRequest request) {
        User creator = findUser(username);

        Ticket ticket = Ticket.builder()
                .serialNumber(generateSerial())
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .status(TicketStatus.OPEN)
                .priority(request.getPriority())
                .creator(creator)
                .build();

        ticket = ticketRepository.save(ticket);

        // ذخیره متن اولیه تیکت به عنوان اولین پیام گفتگو تا در صفحه چت نمایش داده شود
        TicketMessage firstMessage = TicketMessage.builder()
                .ticket(ticket)
                .sender(creator)
                .senderName(creator.getUsername())
                .senderRole(senderRole(creator))
                .content(request.getContent().trim())
                .build();
        messageRepository.save(firstMessage);

        log.info("Ticket #{} created by {} (initial message saved as first chat message)", ticket.getSerialNumber(), username);
        return toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(String username) {
        User user = findUser(username);
        return ticketRepository.findByCreatorIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicket(String username, Long ticketId) {
        Ticket ticket = findAccessibleTicket(username, ticketId);
        return toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketMessageResponse> getMessages(String username, Long ticketId) {
        Ticket ticket = findAccessibleTicket(username, ticketId);
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketMessageResponse sendMessage(String username, Long ticketId, TicketReplyRequest request) {
        Ticket ticket = findAccessibleTicket(username, ticketId);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این تیکت بسته شده است و امکان ارسال پیام وجود ندارد");
        }

        User sender = findUser(username);
        String role = senderRole(sender);

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .sender(sender)
                .senderName(sender.getUsername())
                .senderRole(role)
                .content(request.getContent().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .build();
        message = messageRepository.save(message);

        // آپدیت وضعیت: پاسخ ادمین → «پاسخ داده شد» / پیام کاربر → «در حال بررسی»
        boolean isAdmin = "ADMIN".equals(role);
        if (isAdmin) {
            ticket.setStatus(TicketStatus.ANSWERED);
        } else {
            ticket.setStatus(ticket.getAssignedTo() != null ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN);
        }
        ticketRepository.save(ticket);

        log.info("Message {} added to ticket #{} by {}", message.getId(), ticket.getSerialNumber(), username);
        return toMessageResponse(message);
    }

    // ===================== ادمین / سوپرادمین =====================

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAll(String adminUsername) {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketStatsResponse getStats() {
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TicketPriority p : TicketPriority.values()) {
            byPriority.put(p.name(), ticketRepository.countByPriority(p));
        }

        List<TicketStatsResponse.DailyCount> last7Days = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end = day.plusDays(1).atStartOfDay();
            long count = ticketRepository.countByCreatedAtBetween(start, end);
            last7Days.add(TicketStatsResponse.DailyCount.builder()
                    .date(day.format(fmt))
                    .count(count)
                    .build());
        }

        return TicketStatsResponse.builder()
                .total(ticketRepository.count())
                .open(ticketRepository.countByStatus(TicketStatus.OPEN))
                .inProgress(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS))
                .answered(ticketRepository.countByStatus(TicketStatus.ANSWERED))
                .closed(ticketRepository.countByStatus(TicketStatus.CLOSED))
                .byPriority(byPriority)
                .last7Days(last7Days)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getOperators() {
        Set<User> operators = new LinkedHashSet<>();
        operators.addAll(userRepository.findByRoles_Name("ROLE_ADMIN"));
        operators.addAll(userRepository.findByRoles_Name("ROLE_SUPERADMIN"));
        return operators.stream()
                .map(User::getUsername)
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponse assign(String adminUsername, Long ticketId, String operatorUsername) {
        Ticket ticket = findById(ticketId);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "تیکت بسته شده را نمی‌توان تخصیص داد");
        }

        User operator = userRepository.findByUsername(operatorUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اپراتور یافت نشد"));
        if (!isAdmin(operator)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "فقط ادمین/اپراتور می‌تواند تیکت دریافت کند");
        }

        ticket.setAssignedTo(operator);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket = ticketRepository.save(ticket);

        log.info("Ticket #{} assigned to {} by {}", ticket.getSerialNumber(), operatorUsername, adminUsername);
        return toResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse close(String adminUsername, Long ticketId, String reason) {
        Ticket ticket = findById(ticketId);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "این تیکت از قبل بسته شده است");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setCloseReason(reason.trim());
        ticket.setClosedAt(LocalDateTime.now());
        ticket.setClosedBy(adminUsername);
        ticket = ticketRepository.save(ticket);

        log.info("Ticket #{} closed by {} reason: {}", ticket.getSerialNumber(), adminUsername, reason);
        return toResponse(ticket);
    }

    // ===================== helper ها =====================

    private Ticket findAccessibleTicket(String username, Long ticketId) {
        User user = findUser(username);
        Ticket ticket = findById(ticketId);

        if (!isAdmin(user) && !ticket.getCreator().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما به این تیکت دسترسی ندارید");
        }
        return ticket;
    }

    private Ticket findById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "تیکت یافت نشد"));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر یافت نشد"));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_SUPERADMIN".equals(r.getName()));
    }

    private String senderRole(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet());
        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_SUPERADMIN")) {
            return "ADMIN";
        }
        if (roles.contains("ROLE_CEO")) {
            return "AGENCY";
        }
        return "USER";
    }

    private String senderRolePersian(String role) {
        return switch (role) {
            case "ADMIN" -> "پشتیبانی";
            case "AGENCY" -> "آژانس";
            default -> "کاربر";
        };
    }

    private String generateSerial() {
        for (int i = 0; i < 50; i++) {
            String serial = String.valueOf(100000 + RANDOM.nextInt(900000));
            if (!ticketRepository.existsBySerialNumber(serial)) {
                return serial;
            }
        }
        // fallback: بر اساس زمان
        return String.valueOf(System.currentTimeMillis()).substring(3);
    }

    private TicketResponse toResponse(Ticket t) {
        List<TicketMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(t.getId());

        LocalDateTime lastAt = messages.isEmpty() ? t.getCreatedAt() : messages.get(messages.size() - 1).getCreatedAt();
        String lastPreview = "";
        if (!messages.isEmpty()) {
            String raw = messages.get(messages.size() - 1).getContent();
            lastPreview = raw.length() > 60 ? raw.substring(0, 60) + "…" : raw;
        }

        String creatorRole = senderRole(t.getCreator());

        return TicketResponse.builder()
                .id(t.getId())
                .serialNumber(t.getSerialNumber())
                .title(t.getTitle())
                .content(t.getContent())
                .status(t.getStatus())
                .statusPersian(t.getStatus().getPersianName())
                .priority(t.getPriority())
                .priorityPersian(t.getPriority().getPersianName())
                .creatorRole(creatorRole)
                .creatorRolePersian(senderRolePersian(creatorRole))
                .creatorUsername(t.getCreator().getUsername())
                .assignedToUsername(t.getAssignedTo() != null ? t.getAssignedTo().getUsername() : null)
                .assignedToRolePersian(t.getAssignedTo() != null ? senderRolePersian(senderRole(t.getAssignedTo())) : null)
                .createdAt(t.getCreatedAt())
                .closedAt(t.getClosedAt())
                .closeReason(t.getCloseReason())
                .closedBy(t.getClosedBy())
                .lastMessageAt(lastAt)
                .lastMessagePreview(lastPreview)
                .messageCount(messages.size())
                .build();
    }

    private TicketMessageResponse toMessageResponse(TicketMessage m) {
        boolean support = "ADMIN".equals(m.getSenderRole());
        return TicketMessageResponse.builder()
                .id(m.getId())
                .content(m.getContent())
                .senderUsername(m.getSenderName())
                .senderRole(m.getSenderRole())
                .senderRolePersian(senderRolePersian(m.getSenderRole()))
                .isSupport(support)
                .attachmentUrl(m.getAttachmentUrl())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
