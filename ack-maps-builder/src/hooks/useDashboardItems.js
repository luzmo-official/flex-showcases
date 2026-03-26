import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useDashboardItems() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  const addItem = useCallback((type) => {
    const newItem = {
      id: uuidv4(),
      type,
      options: {},
      slots: [],
      filters: [],
      position: { col: 0, row: 0, sizeX: 24, sizeY: 20 },
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    return newItem;
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItemId((prev) => (prev === id ? null : prev));
  }, []);

  const cloneItem = useCallback((id) => {
    setItems((prev) => {
      const source = prev.find((i) => i.id === id);
      if (!source) return prev;
      const clone = {
        ...source,
        id: uuidv4(),
        position: {
          ...source.position,
          row: source.position.row + source.position.sizeY,
        },
      };
      return [...prev, clone];
    });
  }, []);

  const updateItemSlots = useCallback((id, slots) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, slots } : item))
    );
  }, []);

  const updateItemOptions = useCallback((id, options) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, options } : item))
    );
  }, []);

  const updateItemFilters = useCallback((id, filters) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, filters } : item))
    );
  }, []);

  const syncPositions = useCallback((gridItems) => {
    setItems((prev) =>
      prev.map((item) => {
        const gi = gridItems.find((g) => g.id === item.id);
        if (gi && gi.position) {
          return { ...item, position: gi.position };
        }
        return item;
      })
    );
  }, []);

  return useMemo(() => ({
    items,
    selectedItemId,
    selectedItem,
    setSelectedItemId,
    addItem,
    removeItem,
    cloneItem,
    updateItemSlots,
    updateItemOptions,
    updateItemFilters,
    syncPositions,
  }), [items, selectedItemId, selectedItem, addItem, removeItem, cloneItem,
       updateItemSlots, updateItemOptions, updateItemFilters, syncPositions]);
}
