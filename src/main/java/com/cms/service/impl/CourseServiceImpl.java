package com.cms.service.impl;

import com.cms.dto.request.CourseCreateRequest;
import com.cms.dto.request.CourseUpdateRequest;
import com.cms.dto.response.CourseResponse;
import com.cms.dto.response.LessonResponse;
import com.cms.model.Course;
import com.cms.model.Instructor;
import com.cms.model.Lesson;
import com.cms.repository.CourseRepository;
import com.cms.repository.InstructorRepository;
import com.cms.repository.LessonRepository;
import com.cms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final LessonRepository lessonRepository;

    @Override
    public Page<CourseResponse> getAllCourses(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return courseRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    @Override
    public CourseResponse getCourseById(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return convertToResponse(course);
    }

    @Override
    public Page<CourseResponse> searchCourses(String keyword, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return courseRepository
                .findByTitleContainingIgnoreCase(keyword, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public CourseResponse createCourse(CourseCreateRequest request) {

        Instructor instructor = null;
        if (request.getInstructorId() != null) {
            instructor = instructorRepository.findById(request.getInstructorId()).orElse(null);
        }
        if (instructor == null) {
            try {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    String username = auth.getName();
                    instructor = instructorRepository.findAll().stream()
                            .filter(i -> username.equalsIgnoreCase(i.getUsername()))
                            .findFirst().orElse(null);
                }
            } catch (Exception ignored) {}
        }
        if (instructor == null) {
            instructor = instructorRepository.findAll().stream().findFirst().orElse(null);
        }
        if (instructor == null) {
            instructor = new Instructor();
            instructor.setUsername("default_instructor");
            instructor.setPassword("123");
            instructor.setEmail("instructor_default@gmail.com");
            instructor.setFullName("Giảng viên Mặc Định");
            instructor.setActive(true);
            instructor = instructorRepository.save(instructor);
        }

        Course course = new Course();

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setDuration(request.getDuration());
        course.setInstructor(instructor);

        return convertToResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Instructor instructor = null;
        if (request.getInstructorId() != null) {
            instructor = instructorRepository.findById(request.getInstructorId()).orElse(null);
        }
        if (instructor == null) {
            instructor = course.getInstructor();
        }
        if (instructor == null) {
            instructor = instructorRepository.findAll().stream().findFirst().orElse(null);
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setDuration(request.getDuration());
        if (instructor != null) {
            course.setInstructor(instructor);
        }

        return convertToResponse(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long id) {

        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }

        courseRepository.deleteById(id);
    }

    private CourseResponse convertToResponse(Course course) {

        List<Lesson> lessons =
                lessonRepository.findByCourseIdOrderByLessonOrderAsc(course.getId());

        List<LessonResponse> lessonResponses = lessons.stream()
                .map(this::convertLesson)
                .toList();

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .duration(course.getDuration())
                .createdAt(course.getCreatedAt())
                .instructorName(
                        course.getInstructor() != null
                                ? course.getInstructor().getUsername()
                                : null
                )
                .lessons(lessonResponses)
                .build();
    }

    private LessonResponse convertLesson(Lesson lesson) {

        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .videoUrl(lesson.getVideoUrl())
                .lessonOrder(lesson.getLessonOrder())
                .build();
    }

}