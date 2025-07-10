package com.ZenMate.ZenMateBackend.repository;

import com.ZenMate.ZenMateBackend.entity.ZenUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ZenUserRepository extends JpaRepository<ZenUserEntity, UUID> {
    Optional<ZenUserEntity> findByUsername(String username);
    Optional<ZenUserEntity> findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
