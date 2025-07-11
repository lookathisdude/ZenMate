package com.ZenMate.ZenMateBackend.service;

import com.ZenMate.ZenMateBackend.DTO.RegisterRequest;
import com.ZenMate.ZenMateBackend.DTO.ZenUserInput;
import com.ZenMate.ZenMateBackend.entity.ConfirmationEmailEntity;
import com.ZenMate.ZenMateBackend.entity.ZenUserEntity;
import com.ZenMate.ZenMateBackend.interfaces.ZenUserInterface;
import com.ZenMate.ZenMateBackend.repository.ConfirmationEmailRepository;
import com.ZenMate.ZenMateBackend.repository.ZenUserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;

@Service
public class ZenUserService implements ZenUserInterface {

    private final ZenUserRepository zenUserRepository;
    private final ConfirmationEmailRepository confirmationEmailRepository;
    private final Validator validator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ConfirmationEmailService confirmationEmailService;

    @Value("${app.email.confirmation.expiration-hours}")
    private int expirationHours;

    // Inject PasswordEncoder in constructor
    public ZenUserService(ZenUserRepository zenUserRepository, ConfirmationEmailRepository confirmationEmailRepository, Validator validator, PasswordEncoder passwordEncoder, EmailService emailService, ConfirmationEmailService confirmationEmailService) {
        this.zenUserRepository = zenUserRepository;
        this.confirmationEmailRepository = confirmationEmailRepository;
        this.validator = validator;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.confirmationEmailService = confirmationEmailService;
    }

    private void updateIfNotNull(Consumer<String> setter, String newValue) {
        if (newValue != null && !newValue.isBlank()) {
            setter.accept(newValue);
        }
    }

    private void updatePasswordIfPresent(ZenUserEntity user, String newPassword) {
        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }
    }

    private void sendConfirmationToken(ZenUserEntity user) {
        String token = UUID.randomUUID().toString();
        ConfirmationEmailEntity confirmationEmail = ConfirmationEmailEntity.builder()
                .token(token)
                .zenUserEntity(user)
                .expiryDate(LocalDateTime.now().plusHours(expirationHours))
                .build();

        confirmationEmailRepository.save(confirmationEmail);
        emailService.sendConfirmationEmail(user.getEmail(), token);
    }

    public boolean confirmUser(String token) {
        Optional<ConfirmationEmailEntity> optionalToken = confirmationEmailRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            return false;
        }

        ConfirmationEmailEntity confirmationToken = optionalToken.get();

        if (confirmationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            confirmationEmailRepository.delete(confirmationToken);
            return false;
        }

        ZenUserEntity user = confirmationToken.getZenUserEntity();
        user.setActive(true);
        zenUserRepository.save(user);

        // Delete the token and any other tokens for this user
        confirmationEmailRepository.deleteByZenUserEntity_Id(user.getId());

        return true;
    }


    @Override
    public List<ZenUserEntity> getAllUsers() {
        return zenUserRepository.findAll();
    }

    @Override
    public Optional<ZenUserEntity> getUserById(UUID id) {
        return zenUserRepository.findById(id);
    }

    @Override
    public Optional<ZenUserEntity> getUserByUsername(String username) {
        return zenUserRepository.findByUsername(username);
    }

    @Override
    public Optional<ZenUserEntity> getUserByEmail(String email) {
        return zenUserRepository.findByEmail(email);
    }

    public void register(RegisterRequest request) {
        ZenUserEntity newUser = ZenUserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(false)
                .build();

        zenUserRepository.save(newUser);
        confirmationEmailService.generateAndSendToken(newUser);
    }


    @Override
    public ZenUserEntity createUser(ZenUserInput userInput, PasswordEncoder encoder) {
        if (userInput == null) {
            throw new IllegalStateException("User cannot be null");
        }

        // Manually validate the userInput object
        Set<ConstraintViolation<ZenUserInput>> violations = validator.validate(userInput);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        if (!StringUtils.hasText(userInput.getUsername())) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        if (!StringUtils.hasText(userInput.getEmail())) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        if (!StringUtils.hasText(userInput.getPassword())) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        if (zenUserRepository.existsByUsername(userInput.getUsername())) {
            throw new EntityExistsException("Username already exists");
        }

        if (zenUserRepository.existsByEmail(userInput.getEmail())) {
            throw new EntityExistsException("Email already registered");
        }

        ZenUserEntity userEntity = ZenUserEntity.builder()
                .username(userInput.getUsername())
                .email(userInput.getEmail())
                .timeZone(userInput.getTimeZone())
                // encode password securely
                .password(passwordEncoder.encode(userInput.getPassword()))
                .active(true)
                .build();

        ZenUserEntity savedUser = zenUserRepository.save(userEntity);

        sendConfirmationToken(savedUser);

        return zenUserRepository.save(userEntity);
    }

    @Override
    public Optional<ZenUserEntity> updateUser(UUID id, ZenUserEntity updatedUser) {
        return zenUserRepository.findById(id).map(user -> {
            updateIfNotNull(user::setUsername, updatedUser.getUsername());
            updateIfNotNull(user::setEmail, updatedUser.getEmail());
            updateIfNotNull(user::setTimeZone, updatedUser.getTimeZone());
            updatePasswordIfPresent(user, updatedUser.getPassword());
            // update other allowed fields here explicitly
            return zenUserRepository.save(user);
        });
    }

    @Override
    public Optional<ZenUserEntity> deleteUser(UUID id) {
        return zenUserRepository.findById(id).map(user -> {
            zenUserRepository.deleteById(id);
            return user;
        });
    }
}
