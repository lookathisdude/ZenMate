package com.ZenMate.ZenMateBackend.Exceptions;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(UUID userId) {
        super("User not found with ID: " + userId);
    }

    public UserNotFoundException(String identifier) {
        super("User not found with identifier: " + identifier);
    }

    public UserNotFoundException(UUID userId, Throwable cause) {
        super("User not found with ID: " + userId, cause);
    }
}