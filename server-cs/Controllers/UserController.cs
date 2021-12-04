using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using server_cs.Data;
using server_cs.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace server_cs.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private CWDbContext _context;
        private IConfiguration configuration;

        public UserController(IConfiguration config, CWDbContext context)
        {
            _context = context;
            configuration = config;
        }

        protected override void Dispose(bool disposing) =>
            _context.Dispose();

        [HttpGet]
        public IActionResult Test(string email) => Ok(_context.users.FirstOrDefault(x => x.Email == email));

        [AllowAnonymous]
        [HttpGet("/api/[controller]/auth")]
        public IActionResult Authenticate(string email, string password)
        {
            var user = _context.users.FirstOrDefault(x => x.Email == email && x.Password == password);
            if (user != null)
            {
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new Claim[]
                {
                    new(ClaimsIdentity.DefaultNameClaimType, email),
                    new(ClaimsIdentity.DefaultRoleClaimType, password)
                };

                var token = new JwtSecurityToken(configuration["Jwt:Issuer"],
                    configuration["Jwt:Issuer"],
                    claims,
                    expires: DateTime.Now.AddHours(4),
                    signingCredentials: credentials);
                ServerLog.Log($"Generated token for User {email}");
                return Ok( new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            }
            else
            {
                ServerLog.Log($"User {email} tried to log in unsuccessfully");
                return Unauthorized("Something went wront. Please check E-mail and Password and try again.");
            }
            
        }

        [AllowAnonymous]
        [HttpGet("/api/[controller]/register")]
        public IActionResult Register(string username, string email, string password)
        {
            var checkUser = _context.users.FirstOrDefault(x => x.Email == email);
            if (checkUser != null)
            {
                ServerLog.Log($"User with E-mail \"{email}\" tried to register, but this e-mail is already busy.");
                return BadRequest($"User with E-mail \"{email}\" already exists. Try to log in.");
            }

            User user = new User
            {
                UserName = username,
                Email = email,
                Password = password,
            };
            try
            {
                _context.users.Add(user);
                _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest("Error");
            }
            ServerLog.Log($"User with E-mail {email} registered");
            return Ok();
        }
    }
}
