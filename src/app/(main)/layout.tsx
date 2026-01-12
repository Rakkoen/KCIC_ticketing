import Sidebar from '@/components/layout/sidebar'
import MobileNav from '@/components/layout/mobile-nav'
import { NotificationProvider } from '@/components/notifications/notification-system'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <NotificationProvider>
            {/* Mobile Navigation - Popup Modal (includes mobile header) */}
            <MobileNav user={user} />

            <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                {/* Desktop Sidebar - Compact Icon Only */}
                <Sidebar user={user} />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <main className="flex-1 relative overflow-y-auto focus:outline-none">
                        <div className="py-4 md:py-6">
                            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </NotificationProvider>
    )
}
