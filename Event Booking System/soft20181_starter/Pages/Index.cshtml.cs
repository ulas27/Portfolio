using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace soft20181_starter.Pages
{
    public class IndexModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public IndexModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public List<Event> RecentEvents { get; set; } = new();

        public async Task OnGetAsync()
        {
            RecentEvents = await _context.Events
                .OrderByDescending(e => e.Date)
                .Take(3)
                .ToListAsync();
        }
    }
}
