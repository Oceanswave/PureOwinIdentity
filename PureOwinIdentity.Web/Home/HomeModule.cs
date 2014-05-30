namespace PureOwinIdentity.Web.Home
{
    using Nancy;

    public class HomeModule: NancyModule
    {
        public HomeModule()
        {
            Get["/"] = parameters => {
                return View["index.html"];
            };
        }
    }
}
