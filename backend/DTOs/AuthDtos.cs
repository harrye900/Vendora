namespace backend.DTOs;

public record RegisterDto(string BusinessName, string Email, string Password, string PhoneNumber);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token);
