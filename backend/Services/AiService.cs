using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services;

public class AiService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public AiService(IConfiguration config)
    {
        _apiKey = config["OpenAI:ApiKey"] ?? "NOT_CONFIGURED";
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<string> ExtractOrderFromMessage(string message)
    {
        if (_apiKey == "NOT_CONFIGURED") return JsonSerializer.Serialize(new { error = "OpenAI not configured" });

        var prompt = $@"Extract order details from this customer message. Return JSON with: productName, quantity, size (if mentioned), color (if mentioned), notes.
If you cannot extract order details, return {{ ""error"": ""Could not extract order details"" }}.

Customer message: ""{message}""";

        return await CallOpenAI(prompt);
    }

    public async Task<string> SuggestReply(string customerMessage, string context)
    {
        if (_apiKey == "NOT_CONFIGURED") return "AI not configured. Add your OpenAI API key to appsettings.json";

        var prompt = $@"You are a helpful assistant for a seller on a WhatsApp commerce platform. Suggest a short, friendly reply to this customer message.

Context: {context}
Customer message: ""{customerMessage}""

Reply in a natural, conversational tone. Keep it under 50 words.";

        return await CallOpenAI(prompt);
    }

    private async Task<string> CallOpenAI(string prompt)
    {
        var payload = new
        {
            model = "gpt-3.5-turbo",
            messages = new[] { new { role = "user", content = prompt } },
            max_tokens = 200
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _http.PostAsync("https://api.openai.com/v1/chat/completions", content);
        var json = await response.Content.ReadAsStringAsync();

        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()!;
    }
}
