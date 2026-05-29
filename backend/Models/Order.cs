namespace backend.Models;

public class Order
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentStatus { get; set; } = "Pending";
    public string DeliveryStatus { get; set; } = "Processing";
    public string? CheckoutUrl { get; set; }
    public string? PaymentReference { get; set; }
    public string? ShippingNotes { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}
