using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server_cs.Data;
using server_cs.Hubs;
using System.Text;

namespace server_cs
{
    public sealed class Startup
    {
        private IConfiguration configuration;


        public Startup(IConfiguration config) => configuration = config;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddEntityFrameworkNpgsql().AddDbContext<CWDbContext>(opt =>
                opt.UseNpgsql(configuration.GetConnectionString("CWMessenger")));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["Jwt:Issuer"],
                        ValidAudience = configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
                    };
                });

            services.AddControllers();

            ServerLog.EnableLog();
            ServerLog.Log("Server started.");
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();

            app.UseAuthentication();
            app.UseRouting();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<ChatHub>("/chathub");
                endpoints.MapControllers();
            });
        }
    }
}
