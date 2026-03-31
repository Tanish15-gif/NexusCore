using System.Collections.Generic;
namespace NexusMart.CartItemDto
{
    public class OrderPayload
    {
        public int LinkId { get; set; }
        public List<CartItem> Items { get; set; } = new List<CartItem>();
    }
}