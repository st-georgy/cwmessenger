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
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private CWDbContext _context;
        private IConfiguration configuration;
        private const string avatarsPath = @"..\server-cs\Data\Avatars\";

        public UserController(IConfiguration config, CWDbContext context)
        {
            _context = context;
            configuration = config;
        }

        protected override void Dispose(bool disposing) =>
            _context.Dispose();

        [HttpGet("/api/ping")]
        public IActionResult TestConnection() => Ok("Server is responding");

        [HttpPost("/api/[controller]/auth")]
        public IActionResult Authenticate([FromBody] User userAuth)
        {
            var user = _context.users.FirstOrDefault(x => x.Email == userAuth.Email && x.Password == userAuth.Password);
            if (user != null)
            {
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new Claim[]
                {
                    new(ClaimsIdentity.DefaultNameClaimType, user.Email),
                    new(ClaimsIdentity.DefaultRoleClaimType, user.Password)
                };

                var token = new JwtSecurityToken(configuration["Jwt:Issuer"],
                    configuration["Jwt:Issuer"],
                    claims,
                    expires: DateTime.Now.AddHours(4),
                    signingCredentials: credentials);
                ServerLog.Log($"Generated token for User {user.Email}");
                return Ok( new { token = new JwtSecurityTokenHandler().WriteToken(token), user = user});
            }
            else
            {
                ServerLog.Log($"User {userAuth.Email} tried to log in unsuccessfully");
                return Unauthorized("Something went wront. Please check E-mail and Password and try again.");
            }
            
        }

        [HttpPost("/api/[controller]/register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            var checkUser = _context.users.FirstOrDefault(x => x.Email == user.Email);
            if (checkUser != null)
            {
                ServerLog.Log($"User with E-mail \"{user.Email}\" tried to register, but this e-mail is already busy.");
                return BadRequest($"User with E-mail \"{user.Email}\" already exists. Try to log in.");
            }
            try
            {
                await _context.users.AddAsync(user);
                await _context.SaveChangesAsync();
                ServerLog.Log($"User with E-mail {user.Email} registered");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest("Error");
            }
        }

        [Authorize]
        [HttpPost("/api/[controller]/avatar/update")]
        public async Task<IActionResult> UpdateAvatar([FromHeader] int uid, [FromBody] JsonElement avatarBase64)
        {
            if (!Directory.Exists(avatarsPath)) Directory.CreateDirectory(avatarsPath);
            string fileName = avatarsPath + $"{uid}.txt";

            using (StreamWriter fs = new StreamWriter(fileName, false, Encoding.Default))
                await fs.WriteLineAsync(avatarBase64.ToString());

            return Ok();
        }

        [Authorize]
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
