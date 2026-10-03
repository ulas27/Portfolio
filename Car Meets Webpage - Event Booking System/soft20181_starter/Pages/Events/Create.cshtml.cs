using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using soft20181_starter.Models;
using System.Threading.Tasks;

namespace soft20181_starter.Pages.Events
{

   

    public class CreateModel : PageModel
    {

        public async Task<IActionResult> OnGetAsync()
{
    if (!_context.Events.Any())
    {
        var demoEvent = new Event
{
    Title = "Muscle Car Icons",
    Description = "A stunning lineup of American muscle cars from the golden era.",
    Location = "Downtown Auto Hall",
    Date = DateTime.Now.AddDays(5),
    Capacity = 100,
    Category = "Classic",

    ThumbnailImageUrl = "https://images.squarespace-cdn.com/content/v1/5e76bdd1f65ca44a55d7b137/1584872247381-V63Y8PVP0PVGHDQ3NEQV/IMG_5110-57.jpg",
    ImageUrl1 = "https://static1.topspeedimages.com/wordpress/wp-content/uploads/2023/08/721683_20.jpg",
    ImageCaption1 = "1969 Dodge Charger R/T",
    ImageUrl2 = "https://w0.peakpx.com/wallpaper/577/789/HD-wallpaper-ford-mustang-shelby-muscle-cars-gray-and-blue-vehicle.jpg",
    ImageCaption2 = "Ford Mustang Shelby GT500"
};


        _context.Events.Add(demoEvent);
        await _context.SaveChangesAsync();
    }

    return Page();
}

        private readonly Soft20181StarterContext _context;

        public CreateModel(Soft20181StarterContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Event Event { get; set; }

      

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Events.Add(Event);
            await _context.SaveChangesAsync();

            return RedirectToPage("Index");
        }
    }
}
