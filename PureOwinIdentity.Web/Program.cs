namespace PureOwinIdentity.Web
{
    using System;
    using Microsoft.Owin.Hosting;
    using Ninject;

    class Program
    {
        static void Main(string[] args)
        {
            var kernel = new StandardKernel();

            WebApp.Start("http://localhost:8081", app => app.UseAuth(kernel));

            WebApp.Start("http://localhost", app => app.UseIdentityWeb(kernel));

            Console.WriteLine("Listening on localhost:8081");
            Console.ReadLine();
        }
    }
}
