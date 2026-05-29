using backend.DTOs;
using System.Security.Claims;
using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly WhatsAppService _whatsApp;

    public OrdersController(AppDbContext db, WhatsAppService whatsApp)
    {
        _db = db;
        _whatsApp = whatsApp;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _db.Orders.Where(o => o.UserId == GetUserId()).OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = GetUserId();
        var orders = await _db.Orders.Where(o => o.UserId == userId).ToListAsync();

        return Ok(new
        {
            totalOrders = orders.Count,
            pendingPayments = orders.Count(o => o.PaymentStatus == "Pending"),
            paidOrders = orders.Count(o => o.PaymentStatus == "Paid"),
            shippedOrders = orders.Count(o => o.DeliveryStatus == "Shipped"),
            deliveredOrders = orders.Count(o => o.DeliveryStatus == "Delivered"),
            revenue = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.Amount)
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == GetUserId());
        if (order == null) return NotFound();

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.OrderId == id);
        return Ok(new { order, customer });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = GetUserId(),
            ProductName = dto.ProductName,
            Amount = dto.Amount,
            CreatedAt = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrderDto dto)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == GetUserId());
        if (order == null) return NotFound();

        if (!string.IsNullOrEmpty(dto.PaymentStatus)) order.PaymentStatus = dto.PaymentStatus;
        if (!string.IsNullOrEmpty(dto.DeliveryStatus))
        {
            order.DeliveryStatus = dto.DeliveryStatus;
            if (dto.DeliveryStatus == "Shipped") order.ShippedAt = DateTime.UtcNow;
            if (dto.DeliveryStatus == "Delivered") order.DeliveredAt = DateTime.UtcNow;
        }
        if (!string.IsNullOrEmpty(dto.ProductName)) order.ProductName = dto.ProductName;
        if (dto.Amount.HasValue && dto.Amount > 0) order.Amount = dto.Amount.Value;
        if (!string.IsNullOrEmpty(dto.ShippingNotes)) order.ShippingNotes = dto.ShippingNotes;

        await _db.SaveChangesAsync();

        // Send WhatsApp notifications on status change
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.OrderId == order.Id);
        if (customer != null && !string.IsNullOrEmpty(dto.DeliveryStatus))
        {
            if (dto.DeliveryStatus == "Shipped")
                await _whatsApp.SendShippedNotification(customer.Phone, order.ProductName);
            else if (dto.DeliveryStatus == "Delivered")
                await _whatsApp.SendDeliveredNotification(customer.Phone, order.ProductName);
        }

        return Ok(order);
    }
}
