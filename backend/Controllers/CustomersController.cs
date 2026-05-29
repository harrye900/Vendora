using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomersController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var userId = GetUserId();
        var query = _db.Customers
            .Where(c => _db.Orders.Any(o => o.Id == c.OrderId && o.UserId == userId));

        if (!string.IsNullOrEmpty(search))
            query = query.Where(c => c.Name.Contains(search) || c.Phone.Contains(search));

        var customers = await query
            .GroupBy(c => c.Phone)
            .Select(g => new
            {
                id = g.First().Id,
                name = g.First().Name,
                phone = g.Key,
                address = g.First().Address,
                city = g.First().City,
                state = g.First().State,
                totalOrders = g.Count(),
                lastOrderDate = _db.Orders
                    .Where(o => o.UserId == userId && g.Select(c => c.OrderId).Contains(o.Id))
                    .Max(o => o.CreatedAt)
            })
            .OrderByDescending(c => c.lastOrderDate)
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var userId = GetUserId();
        var orders = await _db.Orders
            .Where(o => o.UserId == userId && _db.Customers.Any(c => c.OrderId == o.Id && c.Phone == phone))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Phone == phone);
        if (customer == null) return NotFound();

        return Ok(new { customer, orders });
    }
}
