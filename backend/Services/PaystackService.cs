using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services;

public class PaystackService
{
    private readonly HttpClient _http;
    private readonly string _secretKey;

    public PaystackService(IConfiguration config)
    {
        _secretKey = config["Paystack:SecretKey"]!;
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _secretKey);
    }

    public async Task<(string checkoutUrl, string reference)?> CreatePaymentLink(string email, decimal amount, Guid orderId, string callbackUrl)
    {
        var payload = new
        {
            email,
            amount = (int)(amount * 100), // Paystack uses kobo
            reference = $"vendora_{orderId}_{DateTime.UtcNow.Ticks}",
            callback_url = callbackUrl,
            metadata = new { orderId = orderId.ToString() }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _http.PostAsync("https://api.paystack.co/transaction/initialize", content);
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.GetProperty("status").GetBoolean()) return null;

        var data = doc.RootElement.GetProperty("data");
        return (data.GetProperty("authorization_url").GetString()!, data.GetProperty("reference").GetString()!);
    }
}
