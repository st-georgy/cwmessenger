using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server_cs.Data;

namespace server_cs.Controllers
{
    [Route("api/[controller]")]
    public class MessageController : Controller
    {
        private CWDbContext _context;

        public MessageController(CWDbContext context) => _context = context;

        protected override void Dispose(bool disposing) =>
            _context.Dispose();

        [Authorize]
        [HttpGet("/api/[controller]/load")]
        public IActionResult GetMessages()
        {
            var messages = _context.messages.OrderByDescending(msg => msg.Id).ToList();
            foreach (Entities.Message msg in messages)
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
