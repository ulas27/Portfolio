using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using soft20181_starter.Models;
using System;
using System.Threading.Tasks;
using soft20181_starter.Data;
using Microsoft.EntityFrameworkCore;


namespace soft20181_starter.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            string[] roles = new[] { "Admin" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            string adminEmail = "admin@carbook.com";
            string adminPassword = "Admin@123";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                var user = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                }
            }

            // Varsayılan Event ekle
using (var scope = serviceProvider.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<Soft20181StarterContext>();
    context.Database.Migrate();

    if (!context.Events.Any())
{
    context.Events.AddRange(
        new Event
        {
            Title = "Drift Challenge",
            Description = "Watch professional drift racers compete in a high-octane showdown!",
            Location = "Istanbul Park",
            Date = DateTime.Now.AddDays(10),
            ImageUrl = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d" // örnek görsel
        },
        new Event
        {
            Title = "Tuning Festival",
            Description = "Join the largest car tuning festival in Turkey for a weekend of modified madness.",
            Location = "Ankara Arena",
            Date = DateTime.Now.AddDays(20),
            ImageUrl = "https://images.unsplash.com/photo-1615375380396-64bb206c8725" // örnek görsel
        }
    );
    await context.SaveChangesAsync();
}

}

        }
    }
}
