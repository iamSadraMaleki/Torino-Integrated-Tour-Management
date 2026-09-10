package com.example.project.ticket.services;

import com.example.project.ticket.dto.*;

import java.util.List;

public interface TicketService {

    // ===== کاربر و مدیر آژانس =====

    TicketResponse create(String username, TicketCreateRequest request);

    List<TicketResponse> getMyTickets(String username);

    TicketResponse getTicket(String username, Long ticketId);

    List<TicketMessageResponse> getMessages(String username, Long ticketId);

    TicketMessageResponse sendMessage(String username, Long ticketId, TicketReplyRequest request);

    // ===== ادمین / سوپرادمین =====

    List<TicketResponse> getAll(String adminUsername);

    TicketStatsResponse getStats();

    List<String> getOperators();

    TicketResponse assign(String adminUsername, Long ticketId, String operatorUsername);

    TicketResponse close(String adminUsername, Long ticketId, String reason);
}
