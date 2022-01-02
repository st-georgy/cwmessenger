using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using server_cs.Data;
using server_cs.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

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

        [AllowAnonymous]
        [HttpGet("/api/ping")]
        public IActionResult TestConnection() => Ok("Server is responding.");

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
                return Ok( new { token = new JwtSecurityTokenHandler().WriteToken(token), user = user});
            }
            else
            {
                ServerLog.Log($"User {email} tried to log in unsuccessfully");
                return Unauthorized("Something went wront. Please check E-mail and Password and try again.");
            }
            
        }

        [AllowAnonymous]
        [HttpGet("/api/[controller]/register")]
        public async Task<IActionResult> Register(string username, string email, string password)
        {
            var checkUser = _context.users.FirstOrDefault(x => x.Email == email);
            if (checkUser != null)
            {
                ServerLog.Log($"User with E-mail \"{email}\" tried to register, but this e-mail is already busy.");
                return BadRequest($"User with E-mail \"{email}\" already exists. Try to log in.");
            }

            var user = new User
            {
                UserName = username,
                Email = email,
                Password = password,
            };
            try
            {
                await _context.users.AddAsync(user);
                await _context.SaveChangesAsync();
                ServerLog.Log($"User with E-mail {email} registered");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest("Error");
            }
        }

        private static string avatarsPath = @"..\server-cs\Data\Avatars\";

        [AllowAnonymous]
        [HttpPost("/api/[controller]/avatar/update")]
        public async Task<IActionResult> UpdateAvatar([FromBody] JsonElement avatarBase64, [FromHeader] int uid)
        {
            
            if (!Directory.Exists(avatarsPath)) Directory.CreateDirectory(avatarsPath);
            string fileName = avatarsPath + $"{uid}.txt";

            using (StreamWriter fs = new StreamWriter(fileName, false, Encoding.Default))
                await fs.WriteLineAsync(avatarBase64.ToString());

            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("/api/[controller]/avatar/get")]
        public IActionResult GetUserAvatar([FromHeader] string uid)
        {
            if (!Directory.Exists(avatarsPath)) return BadRequest();
            var fileName = avatarsPath + $"{uid}.txt";
            if (!System.IO.File.Exists(fileName)) return BadRequest();
            string result = System.IO.File.ReadAllText(fileName);
            return Ok(result);
        }
    }
}
