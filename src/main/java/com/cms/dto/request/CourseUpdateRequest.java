package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseUpdateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @DecimalMin("0.0")
    private BigDecimal price;

    @Min(1)
    private Integer duration;

    private Long instructorId;
}