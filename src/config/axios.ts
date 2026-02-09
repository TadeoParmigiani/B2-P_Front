import axios from "axios";
import { auth } from "@/firebase/firebase";

const firebaseAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

firebaseAxios.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      // Forzar refresh del token para obtener claims actualizados
      const newToken = await user.getIdToken(true);
      localStorage.setItem("token", newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      
      // Debug completo
      const tokenResult = await user.getIdTokenResult();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔐 TOKEN DEBUG');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 Email:', user.email);
      console.log('🆔 UID:', user.uid);
      console.log('📋 Claims:', tokenResult.claims);
      console.log('🔑 Admin:', tokenResult.claims.admin);
      console.log('🎫 Token (primeros 50 chars):', newToken.substring(0, 50) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      const token = localStorage.getItem("token")?.replaceAll('""', "");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.warn('⚠️ Usando token del localStorage (sin usuario activo)');
      } else {
        console.error('❌ No hay token ni usuario autenticado');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

firebaseAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Debug del error
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERROR INTERCEPTADO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', error.response?.status);
    console.log('Mensaje:', error.response?.data?.message);
    console.log('URL:', originalRequest.url);
    console.log('Método:', originalRequest.method);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔄');
          return firebaseAxios(originalRequest);
        }
      } catch (error) {
        console.error(error);
      }
    }

    return Promise.reject(error);
  }
);

export { firebaseAxios };