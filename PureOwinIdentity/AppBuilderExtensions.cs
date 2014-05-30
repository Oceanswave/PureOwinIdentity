namespace PureOwinIdentity
{
    using System;
    using System.Web.Http;
    using AspNet.Identity.RavenDB.Entities;
    using AspNet.Identity.RavenDB.Stores;
    using Microsoft.AspNet.Identity;
    using Microsoft.Owin;
    using Microsoft.Owin.Security.Cookies;
    using Microsoft.Owin.Security.OAuth;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using Ninject;
    using Owin;
    using Raven.Client;
    using Raven.Client.Document;

    public static class AppBuilderExtensions
    {
        public static HttpConfiguration HttpConfiguration
        {
            get;
            private set;
        }

        public static IKernel Kernel
        {
            get;
            private set;
        }
        public static IDocumentStore DocumentStore
        {
            get;
            set;
        }

        public static OAuthAuthorizationServerOptions OAuthOptions
        {
            get;
            private set;
        }

        public static string PublicClientId
        {
            get;
            private set;
        }

        public static IAppBuilder UseAuth(this IAppBuilder app, IKernel kernel)
        {
            if (app == null)
                throw new ArgumentNullException("app");

            if (kernel == null)
                throw new ArgumentNullException("kernel");

            PublicClientId = "self";

            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/Token"),
                //Provider = new ApplicationOAuthProvider(PublicClientId, UserManagerFactory),
                Provider = new GenericApplicationOAuthProvider<RavenUser>(PublicClientId, () => Kernel.Get<UserManager<RavenUser>>()),
                AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
                AllowInsecureHttp = true
            };

            DocumentStore = new DocumentStore
            {
                Url = "http://localhost:8080",
                DefaultDatabase = "AspNetIdentity"
            }.Initialize();


            HttpConfiguration = new HttpConfiguration();

            //Configure Ninject Kernel
            Kernel = new StandardKernel();

            Kernel.Bind<IUserStore<RavenUser>>()
                .To<RavenUserStore<RavenUser>>()
                .WithConstructorArgument("documentSession", (context, obj) =>
                {
                    var session = DocumentStore.OpenAsyncSession();
                    session.Advanced.UseOptimisticConcurrency = true;
                    return session;
                });

            Kernel.Bind<UserManager<RavenUser>>()
                .ToSelf();

            ConfigureAuth(app);
            RegisterWebApi(HttpConfiguration, Kernel);
            app.UseWebApi(HttpConfiguration);

            return app;
        }

        public static void RegisterWebApi(HttpConfiguration config, IKernel kernel)
        {
            // Web API configuration and services
            // Configure Web API to use only bearer token authentication.
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

            // Use camel case for JSON data.
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                "DefaultApi",
                "api/{controller}/{id}",
                new { id = RouteParameter.Optional }
            );

            //Indent and camel case json responses.
            var jsonFormatter = config.Formatters.JsonFormatter;
            var settings = jsonFormatter.SerializerSettings;
            settings.Formatting = Formatting.Indented;
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            //Use Ninject as the dependency resolver
            config.DependencyResolver = new NinjectDependencyResolver(Kernel);
        }

        public static void ConfigureAuth(IAppBuilder app)
        {
            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            app.UseCookieAuthentication(new CookieAuthenticationOptions());
            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Enable the application to use bearer tokens to authenticate users
            app.UseOAuthBearerTokens(OAuthOptions);

            app.UseGoogleAuthentication();
        }
    }
}
