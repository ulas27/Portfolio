using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;

namespace soft20181_starter.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class ManageEventsModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public ManageEventsModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public List<Event> Events { get; set; } = new();

        public async Task OnGetAsync()
        {
            Events = await _context.Events.ToListAsync();
        }
    }
}
