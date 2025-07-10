package com.ZenMate.ZenMateBackend.Exceptions;

import graphql.ErrorClassification;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import org.springframework.graphql.execution.ErrorType;

import java.util.List;
import java.util.Map;

public class GraphQLException extends RuntimeException implements GraphQLError {

    private final String message;

    public GraphQLException(String message) {
        super(message); // Also sets it as RuntimeException message
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public List<SourceLocation> getLocations() {
        return null;
    }

    @Override
    public ErrorType getErrorType() {
        return ErrorType.INTERNAL_ERROR;
    }

    @Override
    public Map<String, Object> getExtensions() {
        return Map.of("code", "USER_CREATION_FAILED");
    }
}
