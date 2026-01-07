import "@/styles/globals.css";
import { AuthProvider } from "@/store/AuthContext";
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

function App({ Component, pageProps }) {
  const router = useRouter();
  const noFooterPages = ['/login', '/signup'];
  const showFooter = !noFooterPages.includes(router.pathname);

  return (
    <AuthProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        scrollBehavior: 'smooth',
        justifyContent: showFooter ? 'flex-start' : 'center'
      }}>
        <main style={{
          flex: '1 0 auto',
          display: showFooter ? 'block' : 'flex',
          alignItems: showFooter ? 'normal' : 'center',
          justifyContent: showFooter ? 'normal' : 'center',
          width: '100%'
        }}>
          <Component {...pageProps} />
        </main>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
