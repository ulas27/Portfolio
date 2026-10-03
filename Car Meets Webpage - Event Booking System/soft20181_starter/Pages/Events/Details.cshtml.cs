using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace soft20181_starter.Pages.Events
{
    public class DetailsModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public DetailsModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public Event Event { get; set; }

        [BindProperty]
        public int Id { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
                return NotFound();

            Event = await _context.Events.FirstOrDefaultAsync(m => m.Id == id);

            if (Event == null)
                return NotFound();

            Id = Event.Id;

            return Page();
        }

       public async Task<IActionResult> OnPostAttendAsync()
{
    if (!User.Identity.IsAuthenticated)
        return RedirectToPage("/Account/Login");

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // ← string
    var userName = User.Identity?.Name ?? "Unknown";

    var eventToAttend = await _context.Events.FindAsync(Id);
    if (eventToAttend == null)
        return NotFound();

    var existing = await _context.Bookings
        .FirstOrDefaultAsync(b => b.UserId == userId && b.EventId == Id); // string == string

    if (existing == null)
    {
        var booking = new Booking
        {
            UserId = userId, 
            EventId = Id,
            CustomerName = userName,
            CustomerEmail = userName
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
    }

    return RedirectToPage("/Events/AttendingList");
}

    }
}
