package com.ZenMate.ZenMateBackend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class UpdateUserInput {
    private UUID id;
    private String username; // optional
    private String email;    // optional
    private String password; // optional
    private String timeZone; // optional
}
