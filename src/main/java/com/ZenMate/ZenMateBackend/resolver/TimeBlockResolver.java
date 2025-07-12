package com.ZenMate.ZenMateBackend.resolver;

import com.ZenMate.ZenMateBackend.DTO.TimeBlockInput;
import com.ZenMate.ZenMateBackend.entity.TimeBlockEntity;
import com.ZenMate.ZenMateBackend.service.TimeBlockService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
public class TimeBlockResolver {
    private final TimeBlockService service;

    public TimeBlockResolver(TimeBlockService service) {
        this.service = service;
    }

    @QueryMapping
    public List<TimeBlockEntity> userTimeBlocks(@Argument UUID userId) {
        return service.getUserTimeBlocks(userId);
    }

    @MutationMapping
    public boolean updateTimeBlockPositions(@Argument List<TimeBlockInput> timeBlocks) {
        // Map input DTO to entity objects
        List<TimeBlockEntity> blocks = timeBlocks.stream()
                .map(input -> {
                    TimeBlockEntity block = new TimeBlockEntity();
                    block.setId(UUID.fromString(input.getId()));
                    block.setPosition(input.getPosition());
                    return block;
                })
                .collect(Collectors.toList());

        return service.updateBlockPositions(blocks);
    }
}
