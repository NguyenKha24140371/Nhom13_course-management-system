package com.cms.controller;

import com.cms.model.Grade;
import com.cms.service.GradeService;
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