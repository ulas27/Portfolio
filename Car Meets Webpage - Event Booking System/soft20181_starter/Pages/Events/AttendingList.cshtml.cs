using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace soft20181_starter.Pages.Events
{
    public class AttendingListModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public AttendingListModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public IList<Event> AttendingEvents { get; set; } = new List<Event>();

        public async Task<IActionResult> OnGetAsync()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return RedirectToPage("/Account/Login");

    // Sadece bu kullanıcıya ait etkinlik kayıtları
    AttendingEvents = await _context.Bookings
        .Where(b => b.UserId == userId)
        .Include(b => b.Event)
        .Select(b => b.Event!)
        .ToListAsync();

    return Page();
}

    }
}
