import { useWidgetStore } from '../../store';
import { HomeView } from './HomeView';
import { MessagesListView } from './MessagesListView';
import { MessagesChatView } from './MessagesChatView';
import { FeedbackView } from './FeedbackView';
import { SearchView } from './SearchView';
import { UpdatesView } from './UpdatesView';
import { HelpView } from './HelpView';
import { PortalNavigation } from './PortalNavigation';

export const PortalContainer = () => {
  const { portalView } = useWidgetStore();

  const renderView = () => {
    switch (portalView) {
      case 'home':
        return <HomeView />;
      case 'messages':
        return <MessagesListView />;
      case 'messages:chat':
        return <MessagesChatView />;
      case 'feedback':
      case 'feedback:success':
        return <FeedbackView />;
      case 'search':
      case 'search:article':
        return <SearchView />;
      case 'updates':
      case 'updates:detail':
        return <UpdatesView />;
      case 'help':
        return <HelpView />;
      default:
        return <HomeView />;
    }
  };

  // Use the base view name as the key so sub-views don't re-trigger the transition
  const viewKey = portalView.split(':')[0];

  // Show bottom nav on top-level tab views, not sub-views (chat, detail, etc.)
  const showNav = portalView === 'home' || portalView === 'messages' || portalView === 'help' || portalView === 'updates';

  return (
    <div className="lr-flex lr-flex-col lr-h-full lr-overflow-hidden">
      <div
        key={viewKey}
        className="lr-flex lr-flex-col lr-flex-1 lr-overflow-hidden lr-animate-fade-in"
      >
        {renderView()}
      </div>
      {showNav && <PortalNavigation />}
    </div>
  );
};
