
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'manager' | 'worker' | 'employee'
                    full_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'manager' | 'worker' | 'employee'
                    full_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'manager' | 'worker' | 'employee'
                    full_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tickets: {
                Row: {
                    id: string
                    title: string
                    description: string
                    status: 'new' | 'in_progress' | 'resolved' | 'closed'
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    created_by: string | null
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    status?: 'new' | 'in_progress' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    status?: 'new' | 'in_progress' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_: string]: never
        }
        Functions: {
            [_: string]: never
        }
        Enums: {
            user_role: 'admin' | 'manager' | 'worker' | 'employee'
        }
    }
}
