import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/ui/sidebar"

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </main>
        {/* Footer */}
        <footer className="border-t border-zinc-800 p-4 text-center text-sm text-zinc-400 bg-zinc-900">
          <p>&copy; METODOLOGIAS Y DESARROLLOS WEB - Sistema de b2-p</p>
        </footer>
      </div>
    </div>
  )
}

export default Layout