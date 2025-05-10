using Microsoft.AspNetCore.Mvc;

using backend.Models;
using backend.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext db, IConfiguration config) {
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto) {
        if (_db.Users.Any(u => u.Username == dto.Username)) return BadRequest("Username taken");

        dto.PasswordHash = AuthHelpers.HashPassword(dto.Password);

        var user = new User {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = dto.PasswordHash
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto) {
        var user = _db.Users.SingleOrDefault(u => u.Username == dto.Username);
        if (user == null || !AuthHelpers.VerifyPassword(dto.Password, user.PasswordHash)) return Unauthorized("Invalid credentials");

        var token = AuthHelpers.GenerateJwtToken(user, _config);

        return Ok(new { token });
    }
}
