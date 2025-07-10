package com.ZenMate.ZenMateBackend.entity;

import com.ZenMate.ZenMateBackend.annotations.ValidatePassword;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "Zen_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZenUserEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    @Size(min = 3, max = 50)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String timeZone;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 100)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ValidatePassword
    private String password;

    @Transient
    @Size(min = 8, max = 30)
    private String plainPassword;

    @Column(nullable = false)
    private boolean active = true;

    // Exclude password encoder from entity serialization
    @Transient
    private PasswordEncoder passwordEncoder;

    @PrePersist
    @PreUpdate
    private void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.active) {
            this.active = true;
        }

        if (plainPassword != null && passwordEncoder != null) {
            this.password = passwordEncoder.encode(plainPassword);
            this.plainPassword = null;
        }
    }


    // Business method to change password
    public void changePassword(String newPlainPassword, PasswordEncoder encoder) {
        this.plainPassword = newPlainPassword;
        this.passwordEncoder = encoder;
        prePersist();
    }
}