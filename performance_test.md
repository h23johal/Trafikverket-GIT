# Performance Optimizations for Pinning/Unpinning

## Problem Identified

The pinning and unpinning operations were experiencing significant latency, taking the same amount of time for 115 entries as for a single one. This indicated a React rendering performance issue rather than a logic or data fetching problem.

## Root Cause Analysis

1. **Unnecessary Re-renders**: The `sortedData` useMemo had `pinnedIds` as a dependency, causing the entire table to recalculate and re-render on every pin/unpin operation.

2. **Inefficient Lookups**: The `isPinned` function used `Array.includes()` which is O(n), causing performance degradation with larger datasets.

3. **Non-memoized Components**: The `TestTableRow` component was defined inside the main component, causing it to be recreated on every render.

4. **Non-memoized Callbacks**: The `onClick` and `onTogglePin` callbacks were recreated on every render, causing unnecessary re-renders of child components.

## Optimizations Implemented

### 1. Removed Unnecessary Dependency

```typescript
// Before
const sortedData = useMemo(() => {
  // ... sorting logic
}, [data, selectedFilters, sortConfig, pinnedIds]); // ❌ pinnedIds caused re-renders

// After
const sortedData = useMemo(() => {
  // ... sorting logic
}, [data, selectedFilters, sortConfig]); // ✅ Removed pinnedIds dependency
```

### 2. Optimized Lookup Performance

```typescript
// Before: O(n) lookup
const isPinned = (id: string) => pinnedIds.includes(id);

// After: O(1) lookup using Set
const pinnedIdsSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);
const isPinned = (id: string) => pinnedIdsSet.has(id);
```

### 3. Memoized Row Component

```typescript
// Before: Component recreated on every render
const TestTableRow: React.FC<{...}> = ({...}) => { ... };

// After: Memoized component outside main component
const TestTableRow = React.memo<{...}>(({...}) => { ... });
```

### 4. Memoized Callbacks

```typescript
// Before: Callbacks recreated on every render
onClick={() => onSelectRow(row)}
onTogglePin={togglePin}

// After: Memoized callbacks
const handleRowClick = useCallback((row: TrafikverketResult) => {
  onSelectRow(row);
}, [onSelectRow]);

const handleTogglePin = useCallback((id: string) => {
  togglePin(id);
}, [togglePin]);
```

## Performance Impact

- **Before**: Pinning/unpinning 115 entries took the same time as 1 entry
- **After**: Pinning/unpinning operations are now O(1) for individual operations and scale linearly with the number of operations
- **Rendering**: Only the affected rows re-render instead of the entire table
- **Lookups**: O(1) instead of O(n) for pin status checks

## Key Takeaways

1. **Dependency Arrays**: Be careful with useMemo/useEffect dependencies - only include what's actually needed
2. **Data Structures**: Use appropriate data structures (Set for lookups, Array for order)
3. **Component Memoization**: Memoize components that don't need frequent updates
4. **Callback Memoization**: Use useCallback for functions passed to child components
5. **Performance Profiling**: When operations scale poorly, investigate rendering patterns first
