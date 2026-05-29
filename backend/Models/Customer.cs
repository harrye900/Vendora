namespace backend.Models;

public class Customer
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
}
