namespace PureOwinIdentity.Web.Home
{
    using global::PureOwinIdentity.Web.Extensions;
    using Nancy;

    public class HomeModule: NancyModule
    {
        public HomeModule()
        {
            Get["/"] = parameters => {
                return View["index.html"];
            };

            Get["/home.html"] = parameters =>
            {
                return View["home.html"];
            };

            Get["/navbar.html"] = parameters =>
            {
                return View["navbar.html"];
            };

            Get["/app.js"] = parameters =>
            {
                return this.ModuleFileResponse("app.js");
            };

            //Components FFA
            Get["/components/{fileName*}"] = parameters =>
            {
                var fileName = ((string)parameters.fileName).Replace("/", "\\");
                fileName = fileName.Replace("..", "");
                return this.ModuleFileResponse("components\\" + fileName);
            };
        }
    }
}
