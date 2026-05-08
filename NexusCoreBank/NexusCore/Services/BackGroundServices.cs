using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using NexusCore.AccountRepositories;

namespace NexusCore.BackGroundServices
{
    public class MidNightInterestRobot : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        public MidNightInterestRobot(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("🤖 Midnight Robot: Booting up...");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var repository = scope.ServiceProvider.GetRequiredService<ITransactionRepository>();
                        int updatedAccounts = await repository.ApplyDailyInterestToSavingsAsync();
                        int UpdatedDailyAccounts = await repository.TakeDailyDepositAmountAsync();
                        if(updatedAccounts > 0)
                        {
                            Console.WriteLine($"🤖 Midnight Robot: SUCCESS! Applied daily interest to {updatedAccounts} accounts.");
                            Console.WriteLine($"🤖 Midnight Robot: Success! Taken Daily Amount from {UpdatedDailyAccounts} Accounts");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"🤖 Midnight Robot ERROR: {ex.Message}");
                }
                Console.WriteLine("🤖 Midnight Robot: Going to sleep for Next 24 Hours...");

                await Task.Delay(TimeSpan.FromHours(24),stoppingToken);
            }
        }
    }
}