package com.ZenMate.ZenMateBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing the confirmation token associated with a user email verification.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmationEmailEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // The unique token string used for confirming user email
    private String token;

    // The user entity associated with this confirmation token
    @OneToOne(targetEntity = ZenUserEntity.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "zen_user_id")
    private ZenUserEntity zenUserEntity;

    // Expiration date and time of the confirmation token
    private LocalDateTime expiryDate;
}
