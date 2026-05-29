using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckoutController : ControllerBase
{
    private readonly AppDbContext _db;

    public CheckoutController(AppDbContext db) => _db = db;

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrder(Guid orderId)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return NotFound("Order not found");

        return Ok(new
        {
            order.Id,
            order.ProductName,
            order.Amount,
            order.PaymentStatus,
            order.CheckoutUrl
        });
    }

    [HttpPost("{orderId}/customer")]
    public async Task<IActionResult> SaveCustomer(Guid orderId, [FromBody] CustomerDto dto)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return NotFound("Order not found");

        var existing = await _db.Customers.FirstOrDefaultAsync(c => c.OrderId == orderId);
        if (existing != null)
        {
            existing.Name = dto.Name;
            existing.Phone = dto.Phone;
            existing.Address = dto.Address;
            existing.City = dto.City;
            existing.State = dto.State;
        }
        else
        {
            _db.Customers.Add(new Customer
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                Name = dto.Name,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                State = dto.State
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { checkoutUrl = order.CheckoutUrl });
    }
}

public record CustomerDto(string Name, string Phone, string Address, string City, string State);
