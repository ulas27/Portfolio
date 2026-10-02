using System.ComponentModel.DataAnnotations;

namespace soft20181_starter.Models
{
   public class Event
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public string Location { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Range(1, 1000)]
    public int Capacity { get; set; }

    public string? ImageUrl { get; set; }


    public string? ThumbnailImageUrl { get; set; }
    public string? ImageUrl1 { get; set; }
    public string? ImageCaption1 { get; set; }
    public string? ImageUrl2 { get; set; }
    public string? ImageCaption2 { get; set; }

    public string Category { get; set; } = string.Empty;
}

}
