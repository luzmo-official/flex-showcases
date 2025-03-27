import { LuzmoDashboardComponent } from "@luzmo/react-embed";
import { embedToken, dashboards } from "../config/embed-token";

interface ChartEditorProps {
  onClose: () => void;
}

export function ChartEditor({ onClose }: ChartEditorProps) {
  return (
    <div className="chart-editor">
      <div className="chart-editor-header">
        <h1>Chart Editor</h1>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>
      <div className="chart-editor-content">
        <LuzmoDashboardComponent
          authKey={embedToken.authKey}
          authToken={embedToken.authToken}
          editMode="editLimited"
          dashboardId={dashboards.userChartLibrary}
        />
      </div>
    </div>
  );
}
