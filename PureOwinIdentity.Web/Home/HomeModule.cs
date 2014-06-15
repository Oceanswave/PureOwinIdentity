namespace PureOwinIdentity.Web.Home
{
    using global::PureOwinIdentity.Web.Extensions;
    using Nancy;

    public class HomeModule: NancyModule
    {
        public HomeModule()
        {
            //Views
            Get["/"] = parameters => {
                return View["index.html"];
            };

            Get["/home"] = parameters =>
            {
                return View["home.html"];
            };

            Get["/navbar"] = parameters =>
            {
                return View["navbar.html"];
            };

            Get["/signup"] = parameters =>
            {
                return View["signup.html"];
            };

            Get["/signin"] = parameters =>
            {
                return View["signin.html"];
            };

            Get["/registerexternal"] = parameters =>
            {
                return View["registerexternal.html"];
            };

            Get["/ManageProfile"] = parameters =>
            {
                return View["ManageProfile.html"];
            };

            //Scripts
            Get["/app.js"] = parameters =>
            {
                return this.ModuleFileResponse("app.js");
            };

            Get["/HomeCtrl.js"] = parameters =>
            {
                return this.ModuleFileResponse("HomeCtrl.js");
            };

            Get["/signinctrl.js"] = parameters =>
            {
                return this.ModuleFileResponse("signinctrl.js");
            };

            Get["/signupctrl.js"] = parameters =>
            {
                return this.ModuleFileResponse("signupctrl.js");
            };

            Get["/registerexternalctrl.js"] = parameters =>
            {
                return this.ModuleFileResponse("registerexternalctrl.js");
            };

            Get["/ManageProfileCtrl.js"] = parameters =>
            {
                return this.ModuleFileResponse("ManageProfileCtrl.js");
            };

            //CSS

            Get["/home.css"] = parameters =>
            {
                return this.ModuleFileResponse("home.css");
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
