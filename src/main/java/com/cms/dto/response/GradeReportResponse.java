package com.example.dto.response;

import java.util.List;

public class GradeReportResponse {

    private String studentId;
    private double average;
    private List<Double> scores;

    public GradeReportResponse(String studentId, double average, List<Double> scores) {
        this.studentId = studentId;
        this.average = average;
        this.scores = scores;
    }

    public String getStudentId() {
        return studentId;
    }

    public double getAverage() {
        return average;
    }

    public List<Double> getScores() {
        return scores;
    }
}