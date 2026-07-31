package com.example.controller;

import com.example.model.Grade;
import com.example.service.GradeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final GradeService service;

    public AdminController(GradeService service) {
        this.service = service;
    }

    @PostMapping("/grade")
    public Grade addGrade(@RequestBody Grade grade) {
        return service.addGrade(grade);
    }

}