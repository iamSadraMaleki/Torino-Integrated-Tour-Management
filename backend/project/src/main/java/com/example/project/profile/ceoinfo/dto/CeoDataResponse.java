package com.example.project.profile.ceoinfo.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CeoDataResponse {
    private String message;
    private Object data;
    private boolean success;
}

