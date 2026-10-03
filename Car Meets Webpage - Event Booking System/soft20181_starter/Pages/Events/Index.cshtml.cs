using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace soft20181_starter.Pages.Events
{
    public class IndexModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public IndexModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        public List<Event> EventList { get; set; } = new();

        [BindProperty(SupportsGet = true)]
        public string? SearchTerm { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? SelectedCategory { get; set; }

        public List<string> Categories { get; set; } = new();

        public async Task OnGetAsync()
        {
            // Kategorileri çek
            Categories = await _context.Events
                .Select(e => e.Category)
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            // Sorguyu hazırla
            var query = _context.Events.AsQueryable();

            // Arama terimi uygula
            if (!string.IsNullOrWhiteSpace(SearchTerm))
            {
                query = query.Where(e =>
                    e.Title.Contains(SearchTerm) ||
                    e.Description.Contains(SearchTerm) ||
                    e.Location.Contains(SearchTerm));
            }

            // Kategori filtresi uygula
            if (!string.IsNullOrWhiteSpace(SelectedCategory))
            {
                query = query.Where(e => e.Category == SelectedCategory);
            }

            // Listeyi yükle
            EventList = await query
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }
    }
}
