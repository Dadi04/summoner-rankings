using Microsoft.IdentityModel.Tokens;

using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

using backend.Models;

public static class AuthHelpers {
    public static string HashPassword(string password) {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }

    public static bool VerifyPassword(string password, string passwordHash) {
        return HashPassword(password) == passwordHash;
    }

    public static string GenerateJwtToken(User user, IConfiguration config) {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddHours(2);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: new[] { 
                new Claim("id", user.Id.ToString()),
                new Claim("username", user.Username)
            },
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
