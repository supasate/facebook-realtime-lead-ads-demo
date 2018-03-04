using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace LeadGenWebhook
{
    public class Program
    {
        const string PORT = "3000";

        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseKestrel()
                .UseStartup<Startup>()
                .UseUrls("https://*:" + PORT)
                .Build();

            host.Run();
        }
    }
}
