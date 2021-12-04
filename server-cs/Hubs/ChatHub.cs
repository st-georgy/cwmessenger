using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace server_cs.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public Task JoinChat(string id) => Groups.AddToGroupAsync(Context.ConnectionId, id);
        public Task LeaveChat(string id) => Groups.RemoveFromGroupAsync(Context.ConnectionId, id);
        public async Task SendMessage(string email, string message) => await Clients.All.SendAsync("RecieveMessage", email, message);
    }
}
