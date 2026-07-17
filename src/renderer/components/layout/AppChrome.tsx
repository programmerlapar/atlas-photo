import AppSidebar from './AppSidebar';
import WindowControls from './WindowControls';

const AppChrome = ({ showSidebar }: { showSidebar: boolean }) => (
  <>
    <div className="window-drag-region desktop-titlebar">
      <div className="window-no-drag absolute right-4 top-3">
        <WindowControls />
      </div>
    </div>
    {showSidebar && <AppSidebar />}
  </>
);

export default AppChrome;
