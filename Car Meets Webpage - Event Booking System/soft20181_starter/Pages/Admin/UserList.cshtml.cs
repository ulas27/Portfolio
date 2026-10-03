using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using soft20181_starter.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soft20181_starter.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class UserListModel : PageModel
    {
        public UserListModel(UserManager<ApplicationUser> userManager)
        {
            UserManager = userManager;
        }

        public UserManager<ApplicationUser> UserManager { get; }

        public List<ApplicationUser> Users { get; set; } = new();

        public async Task OnGetAsync()
        {
            Users = new List<ApplicationUser>(UserManager.Users);
        }
    }
}
