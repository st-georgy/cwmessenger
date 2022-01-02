using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server_cs.Data;

namespace server_cs.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class MessageController : Controller
    {
        private CWDbContext _context;

        public MessageController(CWDbContext context) => _context = context;

        protected override void Dispose(bool disposing) =>
            _context.Dispose();

        [AllowAnonymous]
        [HttpGet("/api/[controller]/load")]
        public IActionResult GetMessages(int startId)
        {
            if (startId < 0) return BadRequest("Start index must be > 0");
            if (startId > getLastMsgId()) return NotFound("No more messages");

            var messages = _context.messages.OrderByDescending(msg => msg.Id)
                .Where(msg => (msg.Id >= startId))
                .ToList();

            int count = messages.Count() > 50 ? 50 : messages.Count();

            var resultMessages = messages.Take(count).ToList();
            foreach (Entities.Message msg in resultMessages)
                msg.UserSender = getUserById(msg.UserSenderId);
            return Ok(messages);
        }

        [HttpGet]
        public IActionResult GetLastMessageId() => Ok(getLastMsgId());

        private int getLastMsgId()
            => _context.messages.OrderByDescending(p => p.Id).Select(r => r.Id).First();

        private Entities.User getUserById(int id) {
            var user = _context.users.First(x => x.Id == id);
            user.Password = "";
            return user;
        }
    }
}
