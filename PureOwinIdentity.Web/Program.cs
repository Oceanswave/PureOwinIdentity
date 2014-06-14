namespace PureOwinIdentity.Web
{
    using System;
    using Microsoft.Owin.Cors;
    using Microsoft.Owin.Hosting;
    using Ninject;
    using Owin;

    class Program
    {
        static void Main(string[] args)
        {
            var kernel = new StandardKernel();

            WebApp.Start("http://localhost:8081", app => app.UseCors(CorsOptions.AllowAll).UseAuth(kernel));

            WebApp.Start("http://localhost", app => app.UseIdentityWeb(kernel));

            Console.WriteLine("API Listening on localhost:8081");
            Console.WriteLine("Web Listening on localhost");
            Console.ReadLine();
        }
    }
}
