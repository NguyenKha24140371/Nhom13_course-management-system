package com.cms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor // Tạo constructor rỗng nếu cần thiết cho các thư viện mapping JSON
@AllArgsConstructor
@Builder
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";

    // THÊM: thông tin user + role để frontend không cần "chữa cháy" bằng ô chọn thủ công nữa
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;

    // Constructor custom chỉ nhận vào 1 tham số (giữ lại để không phá code cũ nếu còn nơi dùng)
    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}