import AppSidebar from './AppSidebar';
import WindowControls from './WindowControls';

const AppChrome = ({
  showSidebar,
  integratedToolbar = false,
}: {
  showSidebar: boolean;
  integratedToolbar?: boolean;
}) => (
  <>
    <div
      className={`window-drag-region desktop-titlebar ${
        integratedToolbar ? 'desktop-titlebar-integrated' : ''
      }`}
    >
      <div className="window-no-drag desktop-caption-controls">
        <WindowControls />
      </div>
    </div>
    {showSidebar && <AppSidebar />}
  </>
);

export default AppChrome;
