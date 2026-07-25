package com.cms.controller;

import com.cms.dto.response.GradeReportResponse;
import com.cms.model.Grade;
import com.cms.service.GradeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final GradeService service;

    public StudentController(GradeService service) {
        this.service = service;
    }

    @GetMapping("/{studentId}/grades")
    public List<Grade> getGrades(@PathVariable String studentId) {
        return service.getStudentGrades(studentId);
    }

    @GetMapping("/{studentId}/report")
    public GradeReportResponse report(@PathVariable String studentId) {
        return service.getReport(studentId);
    }

}