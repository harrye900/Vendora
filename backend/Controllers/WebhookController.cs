using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/payments")]
public class WebhookController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly string _secretKey;
    private readonly WhatsAppService _whatsApp;

    public WebhookController(AppDbContext db, IConfiguration config, WhatsAppService whatsApp)
    {
        _db = db;
        _secretKey = config["Paystack:SecretKey"]!;
        _whatsApp = whatsApp;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook()
    {
        var body = await new StreamReader(Request.Body).ReadToEndAsync();

        // Verify signature
        var signature = Request.Headers["x-paystack-signature"].FirstOrDefault();
        if (string.IsNullOrEmpty(signature)) return Unauthorized();

        var hash = ComputeHmacSha512(body, _secretKey);
        if (hash != signature) return Unauthorized();

        var doc = JsonDocument.Parse(body);
        var eventType = doc.RootElement.GetProperty("event").GetString();

        if (eventType == "charge.success")
        {
            var data = doc.RootElement.GetProperty("data");
            var reference = data.GetProperty("reference").GetString();
            var amount = data.GetProperty("amount").GetInt64() / 100m;

            var order = await _db.Orders.FirstOrDefaultAsync(o => o.PaymentReference == reference);
            if (order != null && order.PaymentStatus != "Paid")
            {
                order.PaymentStatus = "Paid";

                _db.Payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Provider = "Paystack",
                    Reference = reference!,
                    Amount = amount,
                    Status = "Success",
                    PaidAt = DateTime.UtcNow
                });

                await _db.SaveChangesAsync();

                // Send WhatsApp notification
                var customer = await _db.Customers.FirstOrDefaultAsync(c => c.OrderId == order.Id);
                if (customer != null)
                    await _whatsApp.SendPaymentConfirmation(customer.Phone, order.ProductName, order.Amount);
            }
        }

        return Ok();
    }

    private static string ComputeHmacSha512(string data, string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexStringLower(hashBytes);
    }
}
