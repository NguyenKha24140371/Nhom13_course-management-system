package com.cms.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // Ẩn password khi trả về JSON
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    // THÊM FIELD NÀY:
    @Column(name = "full_name")
    private String fullName;

    @Builder.Default
    private boolean active = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private Set<Role> roles;

    // Đã xóa hàm setRole(String) rỗng — hàm này không làm gì cả (bug),
    // khiến DataInitializer seed roles nhưng không thực sự lưu vào DB.
    // Dùng thẳng setRoles(Set<Role>) do Lombok @Setter sinh ra ở trên.
}