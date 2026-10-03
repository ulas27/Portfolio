using System.ComponentModel.DataAnnotations;

namespace soft20181_starter.Models
{

    
    public class Booking
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty; // 🔧 TİP STRİNG OLMALI

    [Required]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string CustomerEmail { get; set; } = string.Empty;

    public int EventId { get; set; }
    public Event Event { get; set; } = null!;

    public DateTime BookingDate { get; set; } = DateTime.Now;
}

}
