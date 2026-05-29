using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly AiService _ai;

    public AiController(AiService ai) => _ai = ai;

    [HttpPost("extract-order")]
    public async Task<IActionResult> ExtractOrder([FromBody] AiMessageRequest request)
    {
        var result = await _ai.ExtractOrderFromMessage(request.Message);
        return Ok(new { result });
    }

    [HttpPost("suggest-reply")]
    public async Task<IActionResult> SuggestReply([FromBody] AiSuggestRequest request)
    {
        var reply = await _ai.SuggestReply(request.Message, request.Context ?? "");
        return Ok(new { reply });
    }
}

public record AiMessageRequest(string Message);
public record AiSuggestRequest(string Message, string? Context);
