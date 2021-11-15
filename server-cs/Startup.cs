namespace server_cs
{
    public sealed class Startup
    {
        private IConfiguration configuration;

        public Startup(IConfiguration config) => configuration = config;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseAuthentication();
            
        }
    }
}
