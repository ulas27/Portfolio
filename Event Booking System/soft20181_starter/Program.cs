using Microsoft.EntityFrameworkCore;
using soft20181_starter;
using soft20181_starter.Models;
using Microsoft.AspNetCore.Identity;
using soft20181_starter.Data;




var builder = WebApplication.CreateBuilder(args);



// Veritabanı bağlantısı
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Kimlik sistemi (Identity)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Yetkilendirme politikası
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Cookie ayarları (Login ve AccessDenied yolları)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
});

// Uygulamanın kendi veritabanı
builder.Services.AddDbContext<Soft20181StarterContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Razor, Session, vb.
builder.Services.AddRazorPages();
builder.Services.AddSession();

var app = builder.Build();

app.UseSession();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication(); // ← Kimlik doğrulama
app.UseAuthorization();  // ← Yetkilendirme

app.MapRazorPages();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedData.InitializeAsync(services);
}


app.Run();
