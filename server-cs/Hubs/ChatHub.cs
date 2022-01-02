using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using server_cs.Data;

namespace server_cs.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private CWDbContext _context;

        public ChatHub(CWDbContext context) => _context = context;

        public Task JoinChat(string id) => Groups.AddToGroupAsync(Context.ConnectionId, id);
        public Task LeaveChat(string id) => Groups.RemoveFromGroupAsync(Context.ConnectionId, id);

        public async Task RecieveMessage(string message, int userID)
        {
            var user = _context.users.FirstOrDefault(x => x.Id == userID);
            var msg = new Entities.Message
            {
                Id = _context.messages.Max(x => x.Id) + 1,
                Text = message,
                timeStamp = DateTime.UtcNow,
                UserSenderId = userID,
                UserSender = user
            };

            await Clients.All.SendAsync("RecieveMessage", msg);
            await _context.messages.AddAsync(msg);
            await _context.SaveChangesAsync();
        }
    }
}
