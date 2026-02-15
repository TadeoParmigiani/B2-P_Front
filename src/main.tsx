// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Provider } from "react-redux";
import { store } from "@/store/store.ts";
import { AppWithObserver } from "./AppWithObserver.tsx";

createRoot(document.getElementById('root')!).render(
<Provider store={store}>
    <AppWithObserver />
</Provider>
)
