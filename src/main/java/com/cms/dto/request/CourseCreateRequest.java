package com.cms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseCreateRequest {

    @NotBlank(message = "Course title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @DecimalMin(value = "0.0")
    private BigDecimal price;

    @Min(1)
    private Integer duration;

    private Long instructorId;
}