package com.cms.controller;

import com.cms.dto.request.LoginRequest;
import com.cms.dto.request.RegisterRequest;
import com.cms.dto.response.JwtAuthResponse;
import com.cms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "API Đăng ký và Đăng nhập người dùng")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
        summary = "Đăng nhập",
        description = "Nhập username và password để nhận JWT Token. Dùng token này cho các API cần xác thực."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Đăng nhập thành công, trả về JWT token",
            content = @Content(schema = @Schema(implementation = JwtAuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Sai username hoặc password", content = @Content),
        @ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ", content = @Content)
    })
    @SecurityRequirements   // Không cần token — endpoint public
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Đăng ký tài khoản mới",
        description = "Tạo tài khoản mới. Nếu không truyền roles thì mặc định là STUDENT."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Đăng ký thành công"),
        @ApiResponse(responseCode = "400", description = "Username hoặc Email đã tồn tại", content = @Content)
    })
    @SecurityRequirements   // Không cần token — endpoint public
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        String response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }
}