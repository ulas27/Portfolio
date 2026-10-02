using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;
using System.Security.Claims;

namespace soft20181_starter.Pages
{
    public class TicketModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public TicketModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public string UserName { get; set; } = "Unknown";
        public List<Event> AttendingEvents { get; set; } = new();

        public async Task OnGetAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            UserName = User.Identity?.Name ?? "Unknown";

            if (string.IsNullOrEmpty(userId))
                return;

            AttendingEvents = await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Event)
                .Select(b => b.Event)
                .ToListAsync();
        }
    }
}
