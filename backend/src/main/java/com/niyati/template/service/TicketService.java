package com.niyati.template.service;

import com.niyati.template.entity.Ticket;
import com.niyati.template.entity.TicketStatus;
import com.niyati.template.entity.User;
import com.niyati.template.repository.TicketRepository;
import com.niyati.template.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public List<Ticket> getAllTickets(String status, Long userId) {
        if (userId != null && status != null) {
            return ticketRepository.findByCreatedByIdAndStatus(userId, TicketStatus.valueOf(status.toUpperCase()));
        } else if (userId != null) {
            return ticketRepository.findByCreatedById(userId);
        } else if (status != null) {
            return ticketRepository.findByStatus(TicketStatus.valueOf(status.toUpperCase()));
        }
        return ticketRepository.findAll();
    }

    public Ticket createTicket(String title, String description, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(user);
        
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(Long id, String title, String description, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (title != null) ticket.setTitle(title);
        if (description != null) ticket.setDescription(description);
        if (status != null) ticket.setStatus(TicketStatus.valueOf(status.toUpperCase()));
        
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public Map<String, Long> getTicketStats(Long userId) {
        List<Ticket> tickets = (userId != null) 
            ? ticketRepository.findByCreatedById(userId) 
            : ticketRepository.findAll();
            
        long openCount = tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        long closedCount = tickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count();
        
        return Map.of(
            "open", openCount,
            "closed", closedCount,
            "total", (long) tickets.size()
        );
    }
}
