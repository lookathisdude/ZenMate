package com.ZenMate.ZenMateBackend.interfaces;

import com.ZenMate.ZenMateBackend.entity.TimeBlockEntity;

import java.util.List;
import java.util.UUID;

public interface TimeBlockInterface {
    List<TimeBlockEntity> getUserTimeBlocks(UUID userId);
    Boolean updateBlockPositions(List<TimeBlockEntity> timeBlocks);
}
