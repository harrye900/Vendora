using System.Security.Claims;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PaystackService _paystack;

    public PaymentsController(AppDbContext db, PaystackService paystack)
    {
        _db = db;
        _paystack = paystack;
    }

    [HttpPost("create-link")]
    public async Task<IActionResult> CreateLink([FromBody] CreateLinkRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId);
        if (order == null) return NotFound("Order not found");

        var callbackUrl = $"{request.CallbackBaseUrl}/checkout/{order.Id}";
        var result = await _paystack.CreatePaymentLink(request.CustomerEmail, order.Amount, order.Id, callbackUrl);

        if (result == null) return BadRequest("Failed to create payment link");

        order.CheckoutUrl = result.Value.checkoutUrl;
        order.PaymentReference = result.Value.reference;
        await _db.SaveChangesAsync();

        return Ok(new { checkoutUrl = result.Value.checkoutUrl, reference = result.Value.reference });
    }
}

public record CreateLinkRequest(Guid OrderId, string CustomerEmail, string CallbackBaseUrl);
