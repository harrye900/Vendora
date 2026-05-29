using System.Security.Claims;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAnalytics()
    {
        var userId = GetUserId();
        var orders = await _db.Orders.Where(o => o.UserId == userId).ToListAsync();

        var totalRevenue = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.Amount);
        var totalOrders = orders.Count;
        var paidOrders = orders.Count(o => o.PaymentStatus == "Paid");
        var avgOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

        // Monthly revenue (last 6 months)
        var monthlyRevenue = orders
            .Where(o => o.PaymentStatus == "Paid" && o.CreatedAt >= DateTime.UtcNow.AddMonths(-6))
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                revenue = g.Sum(o => o.Amount),
                orders = g.Count()
            })
            .OrderBy(x => x.month)
            .ToList();

        // Top products
        var topProducts = orders
            .Where(o => o.PaymentStatus == "Paid")
            .GroupBy(o => o.ProductName)
            .Select(g => new
            {
                product = g.Key,
                sales = g.Count(),
                revenue = g.Sum(o => o.Amount)
            })
            .OrderByDescending(x => x.revenue)
            .Take(5)
            .ToList();

        // Order trends (last 7 days)
        var dailyOrders = orders
            .Where(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-7))
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key.ToString("MMM dd"),
                orders = g.Count(),
                revenue = g.Where(o => o.PaymentStatus == "Paid").Sum(o => o.Amount)
            })
            .OrderBy(x => x.date)
            .ToList();

        return Ok(new
        {
            totalRevenue,
            totalOrders,
            paidOrders,
            avgOrderValue,
            monthlyRevenue,
            topProducts,
            dailyOrders
        });
    }
}
