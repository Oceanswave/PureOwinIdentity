namespace PureOwinIdentity
{
    using Ninject;
    using Ninject.Syntax;
    using System;
    using System.Web.Http.Dependencies;

    public class NinjectDependencyScope : IDependencyScope
    {
        IResolutionRoot m_resolver;

        public NinjectDependencyScope(IResolutionRoot resolver)
        {
            m_resolver = resolver;
        }

        public object GetService(Type serviceType)
        {
            if (m_resolver == null)
                throw new ObjectDisposedException("this", "This scope has been disposed");

            return m_resolver.TryGet(serviceType);
        }

        public System.Collections.Generic.IEnumerable<object> GetServices(Type serviceType)
        {
            if (m_resolver == null)
                throw new ObjectDisposedException("this", "This scope has been disposed");

            return m_resolver.GetAll(serviceType);
        }

        public void Dispose()
        {
            var disposable = m_resolver as IDisposable;
            if (disposable != null)
                disposable.Dispose();

            m_resolver = null;
        }
    }
}
