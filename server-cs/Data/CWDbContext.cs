using Microsoft.EntityFrameworkCore;
using server_cs.Entities;

namespace server_cs.Data
{
    public class CWDbContext : DbContext
    {
        public CWDbContext(DbContextOptions<CWDbContext> options) : base(options) { }

        public DbSet<User> users { get; set; }
        public DbSet<Message> messages { get; set; }
    }
}
