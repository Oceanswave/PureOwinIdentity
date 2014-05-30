namespace PureOwinIdentity.Web.Extensions
{
    using System;
    using System.IO;
    using Nancy;
    using Nancy.Extensions;
    using Nancy.Responses;

    public static class NancyModuleExtensions
    {
        public static GenericFileResponse ModuleFileResponse<T>(this T module, string filePath, string contentType = null)
          where T : NancyModule
        {
            return String.IsNullOrWhiteSpace(contentType)
              ? new GenericFileResponse(Path.Combine(module.GetModuleName(), filePath))
              : new GenericFileResponse(Path.Combine(module.GetModuleName(), filePath), contentType);


        }

        public static void GetAny<T>(this T module, string basePath, params string[] filePaths)
          where T : NancyModule
        {
            foreach (var filePath in filePaths)
            {
                module.Get[filePath] = parameters => module.ModuleFileResponse(basePath + (string)parameters.fileName);
            }
        }
    }
}
