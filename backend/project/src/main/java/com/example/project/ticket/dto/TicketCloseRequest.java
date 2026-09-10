package com.example.project.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCloseRequest {

    @NotBlank(message = "دلیل بستن تیکت الزامی است")
    private String reason;
}
