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
                    role: 'admin' | 'manager' | 'technician' | 'employee'
                    full_name: string | null
                    availability_status: 'online' | 'busy' | 'offline'
                    phone: string | null
                    avatar_url: string | null
                    last_active_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'manager' | 'technician' | 'employee'
                    full_name?: string | null
                    availability_status?: 'online' | 'busy' | 'offline'
                    phone?: string | null
                    avatar_url?: string | null
                    last_active_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'manager' | 'technician' | 'employee'
                    full_name?: string | null
                    availability_status?: 'online' | 'busy' | 'offline'
                    phone?: string | null
                    avatar_url?: string | null
                    last_active_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            tickets: {
                Row: {
                    id: string
                    custom_id: string | null
                    title: string
                    description: string
                    status: 'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    station: 'Halim' | 'Karawang' | 'Padalarang' | 'Tegalluar' | 'Depo Tegal Luar' | null
                    location: string | null
                    equipment_category: string | null
                    wr_document_number: string | null
                    escalation_status: 'yes' | 'no' | 'pending'
                    comments: string | null
                    created_by: string | null
                    assigned_to: string | null
                    first_response_at: string | null
                    resolved_at: string | null
                    sla_response_status: 'on_time' | 'breached' | 'pending'
                    sla_solving_status: 'on_time' | 'breached' | 'pending'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    custom_id?: string | null
                    title: string
                    description: string
                    status?: 'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    station?: 'Halim' | 'Karawang' | 'Padalarang' | 'Tegalluar' | 'Depo Tegal Luar' | null
                    location?: string | null
                    equipment_category?: string | null
                    wr_document_number?: string | null
                    escalation_status?: 'yes' | 'no' | 'pending'
                    comments?: string | null
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    custom_id?: string | null
                    title?: string
                    description?: string
                    status?: 'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    station?: 'Halim' | 'Karawang' | 'Padalarang' | 'Tegalluar' | 'Depo Tegal Luar' | null
                    location?: string | null
                    equipment_category?: string | null
                    wr_document_number?: string | null
                    escalation_status?: 'yes' | 'no' | 'pending'
                    comments?: string | null
                    created_by?: string | null
                    assigned_to?: string | null
                    first_response_at?: string | null
                    resolved_at?: string | null
                    sla_response_status?: 'on_time' | 'breached' | 'pending'
                    sla_solving_status?: 'on_time' | 'breached' | 'pending'
                    created_at?: string
                    updated_at?: string
                }
            }
            incidents: {
                Row: {
                    id: string
                    title: string
                    description: string
                    severity: 'low' | 'medium' | 'high' | 'critical'
                    status: 'open' | 'investigating' | 'resolved' | 'closed'
                    impact: 'none' | 'low' | 'medium' | 'high' | 'critical'
                    urgency: 'low' | 'medium' | 'high' | 'critical'
                    category: string | null
                    root_cause_analysis: string | null
                    resolution_summary: string | null
                    resolution_steps: string[] | null
                    affected_systems: string[] | null
                    affected_users: number
                    estimated_downtime_minutes: number | null
                    actual_downtime_minutes: number | null
                    detected_at: string
                    resolved_at: string | null
                    created_by: string | null
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    severity?: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'open' | 'investigating' | 'resolved' | 'closed'
                    impact?: 'none' | 'low' | 'medium' | 'high' | 'critical'
                    urgency?: 'low' | 'medium' | 'high' | 'critical'
                    category?: string | null
                    root_cause_analysis?: string | null
                    resolution_summary?: string | null
                    resolution_steps?: string[] | null
                    affected_systems?: string[] | null
                    affected_users?: number
                    estimated_downtime_minutes?: number | null
                    actual_downtime_minutes?: number | null
                    detected_at?: string
                    resolved_at?: string | null
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    severity?: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'open' | 'investigating' | 'resolved' | 'closed'
                    impact?: 'none' | 'low' | 'medium' | 'high' | 'critical'
                    urgency?: 'low' | 'medium' | 'high' | 'critical'
                    category?: string | null
                    root_cause_analysis?: string | null
                    resolution_summary?: string | null
                    resolution_steps?: string[] | null
                    affected_systems?: string[] | null
                    affected_users?: number
                    estimated_downtime_minutes?: number | null
                    actual_downtime_minutes?: number | null
                    detected_at?: string
                    resolved_at?: string | null
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            incident_tickets: {
                Row: {
                    id: string
                    incident_id: string
                    ticket_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    incident_id: string
                    ticket_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    incident_id?: string
                    ticket_id?: string
                    created_at?: string
                }
            }
            incident_history: {
                Row: {
                    id: string
                    incident_id: string
                    action: string
                    old_values: Json | null
                    new_values: Json | null
                    changed_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    incident_id: string
                    action: string
                    old_values?: Json | null
                    new_values?: Json | null
                    changed_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    incident_id?: string
                    action?: string
                    old_values?: Json | null
                    new_values?: Json | null
                    changed_by?: string | null
                    created_at?: string
                }
            }
            knowledge_base: {
                Row: {
                    id: string
                    title: string
                    content: string
                    category: 'general' | 'technical' | 'process' | 'policy' | 'troubleshooting' | 'faq'
                    tags: string[] | null
                    status: 'draft' | 'published' | 'archived'
                    view_count: number
                    helpful_count: number
                    not_helpful_count: number
                    last_reviewed_at: string | null
                    review_frequency_days: number
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    category?: 'general' | 'technical' | 'process' | 'policy' | 'troubleshooting' | 'faq'
                    tags?: string[] | null
                    status?: 'draft' | 'published' | 'archived'
                    view_count?: number
                    helpful_count?: number
                    not_helpful_count?: number
                    last_reviewed_at?: string | null
                    review_frequency_days?: number
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    category?: 'general' | 'technical' | 'process' | 'policy' | 'troubleshooting' | 'faq'
                    tags?: string[] | null
                    status?: 'draft' | 'published' | 'archived'
                    view_count?: number
                    helpful_count?: number
                    not_helpful_count?: number
                    last_reviewed_at?: string | null
                    review_frequency_days?: number
                    created_by?: string | null
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            knowledge_search_history: {
                Row: {
                    id: string
                    search_query: string
                    results_count: number
                    clicked_article_id: string | null
                    user_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    search_query: string
                    results_count?: number
                    clicked_article_id?: string | null
                    user_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    search_query?: string
                    results_count?: number
                    clicked_article_id?: string | null
                    user_id?: string | null
                    created_at?: string
                }
            }
            teams: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    team_lead_id: string | null
                    department: string | null
                    status: 'active' | 'inactive' | 'archived'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    team_lead_id?: string | null
                    department?: string | null
                    status?: 'active' | 'inactive' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    team_lead_id?: string | null
                    department?: string | null
                    status?: 'active' | 'inactive' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
            }
            team_members: {
                Row: {
                    id: string
                    team_id: string
                    user_id: string
                    role: 'member' | 'lead' | 'admin'
                    joined_at: string
                    left_at: string | null
                }
                Insert: {
                    id?: string
                    team_id: string
                    user_id: string
                    role?: 'member' | 'lead' | 'admin'
                    joined_at?: string
                    left_at?: string | null
                }
                Update: {
                    id?: string
                    team_id?: string
                    user_id?: string
                    role?: 'member' | 'lead' | 'admin'
                    joined_at?: string
                    left_at?: string | null
                }
            }
            team_projects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    team_id: string
                    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    start_date: string | null
                    end_date: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    team_id: string
                    status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    start_date?: string | null
                    end_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    team_id?: string
                    status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    start_date?: string | null
                    end_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    title: string
                    message: string
                    type: 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'incident' | 'team' | 'system'
                    read: boolean
                    user_id: string
                    related_entity_type: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'project' | null
                    related_entity_id: string | null
                    action_url: string | null
                    metadata: Json | null
                    expires_at: string | null
                    created_at: string
                    read_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    message: string
                    type?: 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'incident' | 'team' | 'system'
                    read?: boolean
                    user_id: string
                    related_entity_type?: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'project' | null
                    related_entity_id?: string | null
                    action_url?: string | null
                    metadata?: Json | null
                    expires_at?: string | null
                    created_at?: string
                    read_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    message?: string
                    type?: 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'incident' | 'team' | 'system'
                    read?: boolean
                    user_id?: string
                    related_entity_type?: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'project' | null
                    related_entity_id?: string | null
                    action_url?: string | null
                    metadata?: Json | null
                    expires_at?: string | null
                    created_at?: string
                    read_at?: string | null
                }
            }
            notification_preferences: {
                Row: {
                    id: string
                    user_id: string
                    email_notifications: boolean
                    push_notifications: boolean
                    ticket_notifications: boolean
                    incident_notifications: boolean
                    team_notifications: boolean
                    system_notifications: boolean
                    notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
                    quiet_hours_start: string | null
                    quiet_hours_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    email_notifications?: boolean
                    push_notifications?: boolean
                    ticket_notifications?: boolean
                    incident_notifications?: boolean
                    team_notifications?: boolean
                    system_notifications?: boolean
                    notification_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
                    quiet_hours_start?: string | null
                    quiet_hours_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    email_notifications?: boolean
                    push_notifications?: boolean
                    ticket_notifications?: boolean
                    incident_notifications?: boolean
                    team_notifications?: boolean
                    system_notifications?: boolean
                    notification_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
                    quiet_hours_start?: string | null
                    quiet_hours_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            analytics_reports: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'custom'
                    query: string
                    parameters: Json
                    schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand'
                    is_active: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type?: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'custom'
                    query: string
                    parameters?: Json
                    schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand'
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: 'ticket' | 'incident' | 'team' | 'user' | 'knowledge' | 'custom'
                    query?: string
                    parameters?: Json
                    schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand'
                    is_active?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            analytics_snapshots: {
                Row: {
                    id: string
                    report_id: string
                    data: Json
                    report_period_start: string | null
                    report_period_end: string | null
                    generated_at: string
                    generated_by: string | null
                }
                Insert: {
                    id?: string
                    report_id: string
                    data: Json
                    report_period_start?: string | null
                    report_period_end?: string | null
                    generated_at?: string
                    generated_by?: string | null
                }
                Update: {
                    id?: string
                    report_id?: string
                    data?: Json
                    report_period_start?: string | null
                    report_period_end?: string | null
                    generated_at?: string
                    generated_by?: string | null
                }
            }
            dashboard_widgets: {
                Row: {
                    id: string
                    name: string
                    type: 'chart' | 'metric' | 'table' | 'list' | 'custom'
                    data_source: 'tickets' | 'incidents' | 'team' | 'knowledge' | 'custom'
                    query: string | null
                    config: Json
                    position_x: number
                    position_y: number
                    width: number
                    height: number
                    is_visible: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type?: 'chart' | 'metric' | 'table' | 'list' | 'custom'
                    data_source?: 'tickets' | 'incidents' | 'team' | 'knowledge' | 'custom'
                    query?: string | null
                    config?: Json
                    position_x?: number
                    position_y?: number
                    width?: number
                    height?: number
                    is_visible?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'chart' | 'metric' | 'table' | 'list' | 'custom'
                    data_source?: 'tickets' | 'incidents' | 'team' | 'knowledge' | 'custom'
                    query?: string | null
                    config?: Json
                    position_x?: number
                    position_y?: number
                    width?: number
                    height?: number
                    is_visible?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    user_id: string
                    ticket_id: string | null
                    action: string
                    target_type: string | null
                    target_id: string | null
                    details: Record<string, unknown>
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    ticket_id?: string | null
                    action: string
                    target_type?: string | null
                    target_id?: string | null
                    details?: Record<string, unknown>
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ticket_id?: string | null
                    action?: string
                    target_type?: string | null
                    target_id?: string | null
                    details?: Record<string, unknown>
                    created_at?: string
                }
            }
            ticket_assignees: {
                Row: {
                    id: string
                    ticket_id: string
                    user_id: string
                    assigned_at: string
                    assigned_by: string | null
                    is_primary: boolean
                    work_notes: string | null
                    completed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    ticket_id: string
                    user_id: string
                    assigned_at?: string
                    assigned_by?: string | null
                    is_primary?: boolean
                    work_notes?: string | null
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string
                    user_id?: string
                    assigned_at?: string
                    assigned_by?: string | null
                    is_primary?: boolean
                    work_notes?: string | null
                    completed_at?: string | null
                    updated_at?: string
                }
            }
            kb_categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    icon: string
                    parent_id: string | null
                    order_index: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    icon?: string
                    parent_id?: string | null
                    order_index?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    icon?: string
                    parent_id?: string | null
                    order_index?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            kb_articles: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    content: string
                    excerpt: string | null
                    category_id: string | null
                    tags: string[]
                    author_id: string
                    status: 'draft' | 'published' | 'archived'
                    view_count: number
                    is_featured: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    content: string
                    excerpt?: string | null
                    category_id?: string | null
                    tags?: string[]
                    author_id: string
                    status?: 'draft' | 'published' | 'archived'
                    view_count?: number
                    is_featured?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    content?: string
                    excerpt?: string | null
                    category_id?: string | null
                    tags?: string[]
                    author_id?: string
                    status?: 'draft' | 'published' | 'archived'
                    view_count?: number
                    is_featured?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            sla_policies: {
                Row: {
                    id: string
                    name: string
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    response_time_hours: number
                    resolution_time_hours: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    response_time_hours?: number
                    resolution_time_hours?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    response_time_hours?: number
                    resolution_time_hours?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            ticket_comments: {
                Row: {
                    id: string
                    ticket_id: string
                    user_id: string
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    ticket_id: string
                    user_id: string
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            user_preferences: {
                Row: {
                    id: string
                    user_id: string
                    theme: string
                    email_notifications: boolean
                    desktop_notifications: boolean
                    notification_frequency: string
                    default_view: string
                    items_per_page: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    theme?: string
                    email_notifications?: boolean
                    desktop_notifications?: boolean
                    notification_frequency?: string
                    default_view?: string
                    items_per_page?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    theme?: string
                    email_notifications?: boolean
                    desktop_notifications?: boolean
                    notification_frequency?: string
                    default_view?: string
                    items_per_page?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_: string]: never
        }
        Functions: {
            create_notification: {
                Args: {
                    p_user_id: string
                    p_title: string
                    p_message: string
                    p_type?: string
                    p_related_entity_type?: string
                    p_related_entity_id?: string
                    p_action_url?: string
                    p_metadata?: Json
                    p_expires_at?: string
                }
                Returns: string
            }
            create_bulk_notifications: {
                Args: {
                    p_user_ids: string[]
                    p_title: string
                    p_message: string
                    p_type?: string
                    p_related_entity_type?: string
                    p_related_entity_id?: string
                    p_action_url?: string
                    p_metadata?: Json
                    p_expires_at?: string
                }
                Returns: {
                    notification_id: string
                }[]
            }
            mark_notification_read: {
                Args: {
                    p_notification_id: string
                    p_user_id: string
                }
                Returns: boolean
            }
            mark_all_notifications_read: {
                Args: {
                    p_user_id: string
                }
                Returns: number
            }
            log_activity: {
                Args: {
                    p_entity_type: string
                    p_entity_id: string
                    p_action: string
                    p_old_values?: Json
                    p_new_values?: Json
                    p_user_id?: string
                }
                Returns: string
            }
        }
        Enums: {
            user_role: 'admin' | 'manager' | 'technician' | 'employee'
        }
    }
}
