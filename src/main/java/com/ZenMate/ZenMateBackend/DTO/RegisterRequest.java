package com.ZenMate.ZenMateBackend.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
}
