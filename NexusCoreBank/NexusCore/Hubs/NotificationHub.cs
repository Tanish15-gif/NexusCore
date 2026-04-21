using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace NexusCore.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        
    }
}