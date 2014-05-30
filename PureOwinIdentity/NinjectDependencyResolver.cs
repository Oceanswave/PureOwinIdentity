namespace PureOwinIdentity
{
    using Ninject;
    using System.Web.Http.Dependencies;

    public class NinjectDependencyResolver : NinjectDependencyScope, IDependencyResolver
    {
        readonly IKernel m_kernel;

        public NinjectDependencyResolver(IKernel kernel)
            : base(kernel)
        {
            m_kernel = kernel;
        }

        public IDependencyScope BeginScope()
        {
            return new NinjectDependencyScope(m_kernel.BeginBlock());
        }
    }
}
