package com.ZenMate.ZenMateBackend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class DeleteUserInput {
    private UUID id;
}
