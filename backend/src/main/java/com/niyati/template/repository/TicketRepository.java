package com.niyati.template.repository;

import com.niyati.template.entity.Ticket;
import com.niyati.template.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCreatedById(Long userId);
    List<Ticket> findByCreatedByIdAndStatus(Long userId, TicketStatus status);
}
