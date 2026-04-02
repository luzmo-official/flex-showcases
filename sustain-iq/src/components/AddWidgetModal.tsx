import { useState } from 'react';

import { ChartEditor } from './ChartEditor';
import { ChartIcon, CHART_TYPE_LABELS } from './icons';
import { WIDGET_TEMPLATES } from '../dataset';

import type { WidgetConfig } from '../types';

interface Props {
  onAdd: (templateKey: string, title?: string) => void;
  onAddCustom: (widget: Omit<WidgetConfig, 'id'>) => void;
  onClose: () => void;
  onOpenAI?: () => void;
  authKey: string;
  authToken: string;
}

type Tab = 'templates' | 'configure';

export function AddWidgetModal({ onAdd, onAddCustom, onClose, onOpenAI, authKey, authToken }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<Tab>('templates');
  const [editKey, setEditKey] = useState<string | null>(null);

  const handleEditTemplate = (key: string) => {
    const tpl = WIDGET_TEMPLATES.find(t => t.key === key);
    if (!tpl) return;
    setEditKey(key);
    setStep('configure');
  };

  const editWidget: WidgetConfig | null = editKey ? (() => {
    const tpl = WIDGET_TEMPLATES.find(t => t.key === editKey);
    if (!tpl) return null;
    return {
      id: '__new__',
      title: tpl.label,
      type: tpl.type,
      slots: JSON.parse(JSON.stringify(tpl.slots)),
      options: (tpl.options ?? { display: { title: false } }) as Record<string, unknown>,
    };
  })() : null;

  const blankWidget: WidgetConfig = {
    id: '__new__',
    title: 'Custom Chart',
    type: 'bar-chart',
    slots: [],
    options: { display: { title: false } },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${step === 'templates' ? 'modal-wide' : 'modal-configure'}`} onClick={e => e.stopPropagation()}>
        {step === 'templates' ? (
          <>
            <div className="modal-header">
              <div>
                <h2>Add Widget</h2>
                <p className="modal-subtitle">Choose a template, build your own, or let AI create one for you</p>
              </div>
              <button className="btn-close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* AI Builder Card */}
            <div className="add-widget-ai-card" onClick={() => { onClose(); onOpenAI?.(); }}>
              <div className="add-widget-ai-left">
                <div className="add-widget-ai-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                    <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
                  </svg>
                </div>
                <div>
                  <span className="add-widget-ai-title">Build with AI</span>
                  <span className="add-widget-ai-desc">Describe what you want to see and AI will create the chart</span>
                </div>
              </div>
              <svg className="add-widget-ai-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {/* Templates Section */}
            <div className="add-widget-section-label">
              <span>Pre-built Templates</span>
              <span className="add-widget-section-count">{WIDGET_TEMPLATES.length}</span>
            </div>

            <div className="tpl-grid">
              {WIDGET_TEMPLATES.map(t => (
                <div
                  key={t.key}
                  className={`tpl-card ${selected === t.key ? 'tpl-card-selected' : ''}`}
                  onClick={() => setSelected(prev => prev === t.key ? null : t.key)}
                  onDoubleClick={() => { onAdd(t.key); onClose(); }}
                >
                  <span className="tpl-card-icon"><ChartIcon type={t.type} size={20} /></span>
                  <span className="tpl-card-title">{t.label}</span>
                  <span className="tpl-card-type">{CHART_TYPE_LABELS[t.type] ?? t.type}</span>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="modal-footer-link" onClick={() => { setEditKey(null); setStep('configure'); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Build from scratch
              </button>
              <div className="modal-footer-right">
                <button className="cfg-btn-back" onClick={onClose}>Cancel</button>
                {selected && (
                  <button className="cfg-btn-edit" onClick={() => handleEditTemplate(selected)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
                <button className="cfg-btn-create" onClick={() => { if (selected) { onAdd(selected); onClose(); } }} disabled={!selected}>
                  Add Widget
                </button>
              </div>
            </div>
          </>
        ) : (
          <ChartEditor
            widget={editWidget ?? blankWidget}
            authKey={authKey}
            authToken={authToken}
            onSave={configured => {
              const { id: _, ...rest } = configured;
              onAddCustom(rest);
              onClose();
            }}
            onCancel={() => { setStep('templates'); setEditKey(null); }}
          />
        )}
      </div>
    </div>
  );
}
