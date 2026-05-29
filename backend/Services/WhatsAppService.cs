using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services;

public class WhatsAppService
{
    private readonly HttpClient _http;
    private readonly string _phoneNumberId;
    private readonly string _accessToken;

    public WhatsAppService(IConfiguration config)
    {
        _phoneNumberId = config["WhatsApp:PhoneNumberId"]!;
        _accessToken = config["WhatsApp:AccessToken"]!;
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

    public async Task SendMessage(string customerPhone, string message)
    {
        if (_phoneNumberId == "YOUR_PHONE_NUMBER_ID") return; // Skip if not configured

        var phone = customerPhone.Replace("+", "").Replace(" ", "");
        var payload = new
        {
            messaging_product = "whatsapp",
            to = phone,
            type = "text",
            text = new { body = message }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        await _http.PostAsync($"https://graph.facebook.com/v18.0/{_phoneNumberId}/messages", content);
    }

    public Task SendPaymentConfirmation(string phone, string productName, decimal amount)
        => SendMessage(phone, $"✅ Payment received!\n\nYour payment of ₦{amount:N0} for \"{productName}\" has been confirmed.\n\nWe'll notify you when it ships.");

    public Task SendShippedNotification(string phone, string productName)
        => SendMessage(phone, $"📦 Your order \"{productName}\" has been shipped!\n\nYou'll receive it soon.");

    public Task SendDeliveredNotification(string phone, string productName)
        => SendMessage(phone, $"✅ Your order \"{productName}\" has been delivered!\n\nThank you for shopping with us.");
}
