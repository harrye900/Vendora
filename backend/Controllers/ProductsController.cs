using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _db.Products
            .Where(p => p.UserId == GetUserId())
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var products = await _db.Products
            .Where(p => p.UserId == GetUserId() && p.Stock <= 5)
            .OrderBy(p => p.Stock)
            .ToListAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        product.Id = Guid.NewGuid();
        product.UserId = GetUserId();
        product.CreatedAt = DateTime.UtcNow;
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Product updated)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.UserId == GetUserId());
        if (product == null) return NotFound();

        if (!string.IsNullOrEmpty(updated.Name)) product.Name = updated.Name;
        if (updated.Price > 0) product.Price = updated.Price;
        if (updated.Stock >= 0) product.Stock = updated.Stock;

        await _db.SaveChangesAsync();
        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.UserId == GetUserId());
        if (product == null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return Ok();
    }
}
