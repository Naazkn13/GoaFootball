import "@/styles/globals.css";
import { AuthProvider } from "@/store/AuthContext";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

import { Toaster } from 'react-hot-toast';

const NO_LAYOUT_PAGES = ['/login', '/signup'];

function App({ Component, pageProps }) {
  const router = useRouter();
  const showLayout = !NO_LAYOUT_PAGES.includes(router.pathname);

  return (
    <AuthProvider>
      <Toaster />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {showLayout && <Header />}
        <main style={{
          flex: '1',
          display: showLayout ? 'block' : 'flex',
          alignItems: showLayout ? 'normal' : 'center',
          justifyContent: showLayout ? 'normal' : 'center',
          width: '100%',
          paddingTop: showLayout ? '80px' : '0' // Offset for the fixed header
        }}>
          <Component {...pageProps} />
        </main>
        {showLayout && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
