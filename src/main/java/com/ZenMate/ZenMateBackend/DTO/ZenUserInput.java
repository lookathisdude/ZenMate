package com.ZenMate.ZenMateBackend.DTO;

import com.ZenMate.ZenMateBackend.annotations.ValidatePassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ZenUserInput {
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    private String timeZone;  // Optional field

    @NotBlank(message = "Password cannot be empty")
    @ValidatePassword
    private String password;
}