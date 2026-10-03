using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using soft20181_starter.Models;

namespace soft20181_starter.Pages
{
    public class ContactModel : PageModel
    {
        private readonly Soft20181StarterContext _context;

        public ContactModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Contact ContactInfo { get; set; } = new();

        public bool Sent { get; set; }

        public void OnGet() { }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
                return Page();

            _context.Contacts.Add(ContactInfo);
            await _context.SaveChangesAsync();

            Sent = true;
            ModelState.Clear();
            ContactInfo = new(); // formu temizle
            return Page();
        }
    }
}
