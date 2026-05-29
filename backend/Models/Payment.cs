namespace backend.Models;

public class Payment
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Provider { get; set; } = "Paystack";
    public string Reference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? PaidAt { get; set; }
    public Order Order { get; set; } = null!;
}
