package com.example.controller;

import com.example.dto.response.GradeReportResponse;
import com.example.model.Grade;
import com.example.service.GradeService;
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