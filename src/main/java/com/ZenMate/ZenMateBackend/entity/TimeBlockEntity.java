package com.ZenMate.ZenMateBackend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TimeBlockEntity {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    private int position;

    private UUID userId;
}
