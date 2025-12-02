import "@/styles/globals.css";
import { AuthProvider } from "@/store/AuthContext";

function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default App;
