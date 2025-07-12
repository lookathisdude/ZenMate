package com.ZenMate.ZenMateBackend.repository;

import com.ZenMate.ZenMateBackend.entity.TimeBlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TimeBlockRepository extends JpaRepository<TimeBlockEntity, UUID> {
    List<TimeBlockEntity> findAllByUserIdOrderByPosition(UUID userId);
}
