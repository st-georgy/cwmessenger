namespace server_cs.Entities
{
    public class Message
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime timeStamp { get; set; }
        
        public User? UserSender { get; set; }
        public int UserSenderId { get; set; }
    }
}
