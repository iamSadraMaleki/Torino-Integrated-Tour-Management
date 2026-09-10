package com.example.project.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAssignRequest {

    @NotBlank(message = "نام کاربری اپراتور الزامی است")
    private String operatorUsername;
}
