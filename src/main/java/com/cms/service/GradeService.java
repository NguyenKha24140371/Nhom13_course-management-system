package com.example.service;

import com.example.dto.response.GradeReportResponse;
import com.example.model.Grade;
import com.example.repository.GradeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradeService {

    private final GradeRepository repository;

    public GradeService(GradeRepository repository) {
        this.repository = repository;
    }

    public Grade addGrade(Grade grade) {
        return repository.save(grade);
    }

    public List<Grade> getAllGrades() {
        return repository.findAll();
    }

    public List<Grade> getStudentGrades(String studentId) {
        return repository.findByStudentId(studentId);
    }

    public GradeReportResponse getReport(String studentId) {

        List<Grade> grades = repository.findByStudentId(studentId);

        double avg = grades.stream()
                .mapToDouble(Grade::getScore)
                .average()
                .orElse(0);

        List<Double> scores = grades.stream()
                .map(Grade::getScore)
                .toList();

        return new GradeReportResponse(studentId, avg, scores);
    }

}