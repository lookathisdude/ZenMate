package com.ZenMate.ZenMateBackend.service;

import com.ZenMate.ZenMateBackend.entity.ConfirmationEmailEntity;
import com.ZenMate.ZenMateBackend.entity.ZenUserEntity;
import com.ZenMate.ZenMateBackend.repository.ConfirmationEmailRepository;
import com.ZenMate.ZenMateBackend.repository.ZenUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service responsible for generating confirmation tokens, sending confirmation emails,
 * and confirming users based on token validation.
 */
@Service
public class ConfirmationEmailService {

    private final ConfirmationEmailRepository confirmationEmailRepository;
    private final ZenUserRepository zenUserRepository;
    private final EmailService emailService;

    @Autowired
    public ConfirmationEmailService(
            ConfirmationEmailRepository confirmationEmailRepository,
            ZenUserRepository zenUserRepository,
            EmailService emailService
    ) {
        this.confirmationEmailRepository = confirmationEmailRepository;
        this.zenUserRepository = zenUserRepository;
        this.emailService = emailService;
    }

    /**
     * Generates a unique confirmation token for the given user, saves it,
     * and sends a confirmation email with the token link.
     *
     * @param user The user for whom the confirmation token will be generated.
     */
    public void generateAndSendToken(ZenUserEntity user) {
        // Generate a random UUID token
        String token = UUID.randomUUID().toString();

        // Create ConfirmationEmailEntity with token, user, and expiry time (24 hours)
        ConfirmationEmailEntity confirmationToken = ConfirmationEmailEntity.builder()
                .token(token)
                .zenUserEntity(user)
                .expiryDate(LocalDateTime.now().plusHours(24)) // token valid for 24 hours
                .build();

        // Persist the confirmation token entity in the database
        confirmationEmailRepository.save(confirmationToken);

        // Send the confirmation email with the token included in the URL
        emailService.sendConfirmationEmail(user.getEmail(), token);
    }

    /**
     * Validates the confirmation token, activates the associated user if valid,
     * and removes all confirmation tokens for the user.
     *
     * This method runs within a transactional context to ensure data consistency.
     *
     * @param token The confirmation token to validate.
     * @return true if the user was successfully confirmed; false otherwise.
     */
    @Transactional
    public boolean confirmUser(String token) {
        // Retrieve the confirmation token entity by token string
        Optional<ConfirmationEmailEntity> optionalToken = confirmationEmailRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            // Token not found - invalid confirmation attempt
            return false;
        }

        ConfirmationEmailEntity confirmationToken = optionalToken.get();

        // Check if the token is expired
        if (confirmationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            // Remove expired token from the database
            confirmationEmailRepository.delete(confirmationToken);
            return false;
        }

        // Activate the user associated with the valid token
        ZenUserEntity user = confirmationToken.getZenUserEntity();
        user.setActive(true);
        zenUserRepository.save(user);

        // Delete all confirmation tokens for this user after successful confirmation
        confirmationEmailRepository.deleteByZenUserEntity_Id(user.getId());

        return true;
    }
}
