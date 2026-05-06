import { itemTypeCategories } from '../data/itemTypes';

export default function AddItemDialog({ onSelect, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="add-item-overlay" onClick={handleOverlayClick}>
      <div className="add-item-dialog">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: '1px solid var(--app-border)',
        }}>
          <h2>Add to Dashboard</h2>
          <luzmo-button size="s" variant="secondary" quiet onClick={onClose}>
            Close
          </luzmo-button>
        </div>

        {itemTypeCategories.map((category) => (
          <div className="add-item-category" key={category.label}>
            <div className="add-item-category-title">{category.label}</div>
            <div className="add-item-grid">
              {category.types.map((item) => (
                <button
                  type="button"
                  className="add-item-card"
                  key={item.type}
                  onClick={() => onSelect(item.type)}
                >
                  <span className="add-item-card-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
