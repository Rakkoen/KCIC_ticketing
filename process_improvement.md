# React Performance Optimization Plan

## Objective
Optimize the application's performance by strategically implementing `useMemo`, `useCallback`, and `React.memo` to reduce unnecessary re-renders and computation overhead, focusing on high-impact areas like dashboards and data-heavy lists.

## Priority Areas for Optimization

After analyzing the application structure, the following areas have been identified as top priorities for optimization:

1.  **Dashboard (Analytics & Statistics)**
    *   **Reason**: Contains heavy data aggregation, charts, and statistics calculations.
    *   **Target Components**: `StatsCards`, `RoomStatusGrid`, `TemperatureTrendChart`.
2.  **Tickets List Page**
    *   **Reason**: Displays a potentially large list of tickets with filtering and sorting options which triggers frequent re-renders.
    *   **Target Components**: `TicketCard` (list item), `TicketFilters`.
3.  **Knowledge Base (KB) Article List**
    *   **Reason**: Similar to tickets, this involves filtering and mapping over lists.
    *   **Target Components**: `KBArticleCard`, `CategorySidebar`.
4.  **Complex Forms (Ticket/Incident Creation)**
    *   **Reason**: Input fields and validation logic can cause the entire form to re-render on every keystroke if not managed correctly.
    *   **Target Components**: `TicketForm` (if exists or split from page), Input wrapper components.
5.  **Data Grids / Tables**
    *   **Reason**: Rendering many rows of data is expensive.
    *   **Target Components**: Any `DataTable` or `Table` rows.

## Implementation Strategy

### 1. Dashboard Optimization
*   **useMemo**:
    *   Memoize statistics calculations (total tickets, resolved count, etc.) derived from raw data.
    *   Memoize chart data formatting functions (transforming API data into Recharts format).
*   **React.memo**:
    *   Wrap `StatsCard` to prevent re-rendering when other parts of the dashboard update but stats remain the same.
    *   Wrap individual Chart components if they take significant time to render.

### 2. Tickets & Lists Optimization
*   **useMemo**:
    *   Memoize the filtered and sorted list of tickets. `const filteredTickets = useMemo(() => tickets.filter(...), [tickets, filter])`.
*   **useCallback**:
    *   Memoize event handlers passed to list items (e.g., `handleTicketClick`, `handleStatusChange`). `const handleDelete = useCallback((id) => ..., [])`.
*   **React.memo**:
    *   Wrap `TicketCard` / `ListItem` components. This is crucial so that modifying one ticket doesn't re-render the entire list of 50+ tickets.

### 3. Common/UI Components
*   **React.memo**:
    *   Wrap frequently used atomic components if they receive complex props or are used in large loops (e.g., `StatusBadge`, `UserAvatar`).
*   **useCallback**:
    *   Ensure custom hooks returning functions (like `useToast` or data fetchers) use `useCallback` internally to provide stable references.

## Step-by-Step Execution Plan

1.  **Analyze & Measure**:
    *   Review `src/app/(main)/dashboard/page.tsx` and related components.
    *   Review `src/app/(main)/tickets/page.tsx` (or list view).
2.  **Implement Optimizations**:
    *   **Phase 1**: Dashboard components (Calculations & Charts).
    *   **Phase 2**: Ticket Lists & Cards (Row-level memoization).
    *   **Phase 3**: Shared UI components and hooks.
3.  **Verify**:
    *   Ensure functionality is unchanged (CRUD operations work).
    *   Verify through React DevTools that re-renders are reduced (e.g., changing a filter doesn't re-render unrelated components).

## Proposed File Changes

### Example: Ticket List Optimization

```tsx
// src/components/tickets/TicketList.tsx

// 1. Wrap Item in memo
const TicketCard = memo(({ ticket, onSelect }: TicketCardProps) => {
  // ... render logic
});

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  // 2. Memoize expensive filtering
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets]);

  // 3. Stable callback for children
  const handleSelect = useCallback((id: string) => {
    router.push(\`/tickets/\${id}\`);
  }, [router]);

  return (
    <div className="space-y-4">
      {sortedTickets.map(ticket => (
        <TicketCard 
          key={ticket.id} 
          ticket={ticket} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );
}
```

### Example: Dashboard Calculations

```tsx
// src/app/(main)/dashboard/page.tsx

export default function Dashboard() {
  const { data: tickets } = useTickets();

  // 1. Expensive aggregation
  const stats = useMemo(() => {
    console.log("Recalculating stats..."); // Verify it only runs when tickets change
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      // ... complex math
    };
  }, [tickets]);

  return <StatsGrid stats={stats} />;
}
```
