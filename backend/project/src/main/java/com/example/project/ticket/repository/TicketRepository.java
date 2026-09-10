package com.example.project.ticket.repository;

import com.example.project.ticket.model.Ticket;
import com.example.project.ticket.model.TicketPriority;
import com.example.project.ticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsBySerialNumber(String serialNumber);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
