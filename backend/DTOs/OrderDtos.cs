namespace backend.DTOs;

public record CreateOrderDto(string ProductName, decimal Amount);
public record UpdateOrderDto(string? PaymentStatus, string? DeliveryStatus, string? ProductName, decimal? Amount, string? ShippingNotes);
