package com.example.project.ticket.dto;

import com.example.project.ticket.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCreateRequest {

    @NotBlank(message = "عنوان تیکت الزامی است")
    @Size(max = 200, message = "عنوان حداکثر ۲۰۰ کاراکتر")
    private String title;

    @NotBlank(message = "متن تیکت الزامی است")
    @Size(max = 5000, message = "متن تیکت حداکثر ۵۰۰۰ کاراکتر")
    private String content;

    @NotNull(message = "اولویت تیکت الزامی است")
    private TicketPriority priority;
}
