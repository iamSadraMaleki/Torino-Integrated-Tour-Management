package com.example.project.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketReplyRequest {

    @NotBlank(message = "متن پیام الزامی است")
    @Size(max = 5000, message = "متن پیام حداکثر ۵۰۰۰ کاراکتر")
    private String content;

    /** پیوست (data URL) — اختیاری */
    private String attachmentUrl;
}
