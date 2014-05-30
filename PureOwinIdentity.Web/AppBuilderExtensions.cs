namespace PureOwinIdentity.Web
{
    using global::Owin;
    using Nancy;
    using Nancy.Owin;
    using Ninject;

    public static class AppBuilderExtensions
    {
        public static IAppBuilder UseIdentityWeb(this IAppBuilder app, IKernel kernel)
        {
            return app.UseNancy(options => options.PassThroughWhenStatusCodesAre(HttpStatusCode.NotFound,
              HttpStatusCode.InternalServerError));
        }
    }
}
