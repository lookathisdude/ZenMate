package com.ZenMate.ZenMateBackend.service;

import com.ZenMate.ZenMateBackend.entity.TimeBlockEntity;
import com.ZenMate.ZenMateBackend.interfaces.TimeBlockInterface;
import com.ZenMate.ZenMateBackend.repository.TimeBlockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TimeBlockService implements TimeBlockInterface {

    private final TimeBlockRepository timeBlockRepository;

    public TimeBlockService(TimeBlockRepository timeBlockRepository) {
        this.timeBlockRepository = timeBlockRepository;
    }


    @Override
    public List<TimeBlockEntity> getUserTimeBlocks(UUID userId) {
        return timeBlockRepository.findAllByUserIdOrderByPosition(userId);
    }

    @Override
    @Transactional
    public Boolean updateBlockPositions(List<TimeBlockEntity> timeBlocks) {
        timeBlockRepository.saveAll(timeBlocks);
        return true;
    }
}
