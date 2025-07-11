package com.ZenMate.ZenMateBackend.repository;

import com.ZenMate.ZenMateBackend.entity.ConfirmationEmailEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfirmationEmailRepository extends JpaRepository<ConfirmationEmailEntity, UUID> {
    Optional<ConfirmationEmailEntity> findByToken(String token);
    void deleteByZenUserEntity_Id(UUID userId);
}
