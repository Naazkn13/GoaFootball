import "@/styles/globals.css";
import { AuthProvider } from "@/store/AuthContext";
import Footer from '../components/Footer';

function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <>
        <Component {...pageProps} />
        <Footer />
      </>
    </AuthProvider>
  );
}

export default App;
