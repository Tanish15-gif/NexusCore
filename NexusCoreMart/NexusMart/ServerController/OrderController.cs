using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using NexusMart.OrderOperation;
using NexusMart.CartItemDto;

namespace NexusMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly OrderReciept _orderReciept;
        public OrderController
        (
            OrderService orderService,
            OrderReciept orderReciept
        )
        {
            _orderService  = orderService;
            _orderReciept = orderReciept;
        }

        [HttpGet("my-orders")]
        public IActionResult GetMyOrders()
        {
            var secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = _orderService.GetOrderHistory(secureid);
            return Ok(list);
        }
        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceMyOrder([FromBody] OrderPayload orderPayload)
        {
            var secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                int generatedId = await _orderService.PlaceNewOrder(secureid,orderPayload);
                return Ok(new {message = "Payment Successful!",orderid = generatedId});
                
            }
            catch (Exception ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }
        [HttpGet("my-orders/orders/{orderid}/details")]
        public IActionResult GetMyOrders(int orderid,int customerid)
        {
            var secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = _orderReciept.GetOrderDetails(orderid,secureid);
            return Ok(list);
        }
    }
}