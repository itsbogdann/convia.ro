import { useWidgetStore } from '../../store';
import { usePortalColors } from './usePortalColors';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 18.1833V10.9C20 10.153 19.6839 9.43656 19.1213 8.90834L13.4142 3.54999C12.6332 2.81667 11.3668 2.81667 10.5858 3.54999L4.87868 8.90834C4.31607 9.43656 4 10.153 4 10.9V18.1833C4 19.7389 5.34315 21 7 21H17C18.6569 21 20 19.7389 20 18.1833Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MessagesIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 17.1101V19.1101H12.5487C12.8559 19.1101 12.9156 19.1123 12.9691 19.1199C13.0226 19.1274 13.0807 19.1417 13.3759 19.2264L18.2242 20.6172C18.6409 20.7368 18.9939 20.838 19.2864 20.9041C19.5876 20.9722 19.8991 21.0214 20.2226 20.9974C21.3944 20.9101 22.4074 20.1469 22.8143 19.0446C22.9267 18.7402 22.9652 18.4273 22.9829 18.119C23 17.8196 23 17.4524 23 17.019L23 11.0001C23 9.61606 23 8.49998 22.9074 7.60535C22.8117 6.68166 22.6088 5.88167 22.1271 5.17736C21.7769 4.66541 21.3346 4.22307 20.8226 3.87293C20.1183 3.39123 19.3183 3.18826 18.3946 3.09261C17.5 2.99997 16.3839 2.99998 14.9999 3H12V5H14.9449C16.3969 5 17.4091 5.00125 18.1886 5.08197C18.9509 5.16091 19.3768 5.30712 19.6936 5.52376C20.0008 5.73384 20.2662 5.99925 20.4762 6.30642C20.6929 6.62318 20.8391 7.04908 20.918 7.81135C20.9987 8.59088 21 9.60315 21 11.0551L21 16.9909C21 17.46 20.9996 17.7694 20.9861 18.0048C20.9728 18.2377 20.9495 18.3211 20.9381 18.3519C20.8024 18.7194 20.4648 18.9738 20.0742 19.0029C20.0414 19.0053 19.9548 19.0047 19.7273 18.9533C19.4973 18.9014 19.1997 18.8164 18.7488 18.6871L13.9274 17.304L13.8821 17.291C13.6565 17.2261 13.4572 17.1688 13.2476 17.1393C13.0379 17.1099 12.8305 17.11 12.5958 17.1101L12.5487 17.1101H12Z" />
    <path fill="currentColor" opacity={filled ? 1 : 0.5} d="M4.30642 5.52376C4.62318 5.30712 5.04908 5.16091 5.81136 5.08197C6.59088 5.00125 7.60315 5 9.05507 5H12V3H9.00009C7.61606 2.99998 6.49998 2.99997 5.60535 3.09261C4.68166 3.18826 3.88167 3.39123 3.17736 3.87293C2.66541 4.22307 2.22307 4.66541 1.87293 5.17736C1.39123 5.88167 1.18826 6.68166 1.09261 7.60535C0.999971 8.49998 0.999984 9.61606 1 11.0001V11.11C0.999984 12.4941 0.999971 13.6101 1.09261 14.5048C1.18826 15.4285 1.39123 16.2285 1.87293 16.9328C2.22307 17.4447 2.66541 17.8871 3.17736 18.2372C3.88167 18.7189 4.68166 18.9219 5.60535 19.0175C6.49998 19.1102 7.61606 19.1101 9.00008 19.1101L12 19.1101V17.1101L9.05507 17.1101C7.60315 17.1101 6.59088 17.1089 5.81136 17.0282C5.04908 16.9492 4.62318 16.803 4.30642 16.5864C3.99925 16.3763 3.73384 16.1109 3.52376 15.8037C3.30712 15.487 3.16091 15.0611 3.08197 14.2988C3.00125 13.5193 3 12.507 3 11.0551C3 9.60315 3.00125 8.59088 3.08197 7.81135C3.16091 7.04908 3.30712 6.62318 3.52376 6.30642C3.73384 5.99925 3.99925 5.73384 4.30642 5.52376Z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChangelogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

// Derive which tab should be active based on the current portal view
const viewToTab = (view: string): 'home' | 'messages' | 'help' | 'changelog' => {
  if (view === 'messages') return 'messages';
  if (view === 'help') return 'help';
  if (view === 'updates') return 'changelog';
  return 'home';
};

export const PortalNavigation = () => {
  const { portalView, setPortalTab, theme } = useWidgetStore();
  const colors = usePortalColors();
  const portal = theme.portal;

  if (!portal) return null;

  const activeTab = viewToTab(portalView);
  const enabledTabIds = portal.tabs.filter(t => t.enabled).map(t => t.id);

  const allTabs = [
    { id: 'home' as const, label: portal.tabs.find(t => t.id === 'home')?.label || 'Home', Icon: HomeIcon },
    { id: 'messages' as const, label: portal.tabs.find(t => t.id === 'messages')?.label || 'Conversations', Icon: MessagesIcon },
    { id: 'help' as const, label: portal.tabs.find(t => t.id === 'help')?.label || 'Help Center', Icon: HelpIcon },
    { id: 'changelog' as const, label: portal.tabs.find(t => t.id === 'changelog')?.label || 'Changelog', Icon: ChangelogIcon },
  ];

  const tabs = allTabs.filter(t => enabledTabIds.includes(t.id));

  return (
    <div
      className="lr-flex lr-shrink-0"
      style={{
        backgroundColor: colors.navBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setPortalTab(tab.id)}
            className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-flex-1 lr-py-2.5 lr-gap-1 lr-transition-all lr-relative"
            style={{
              color: isActive ? portal.navActiveColor : portal.navTextColor,
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div
                className="lr-absolute lr-top-0 lr-h-0.5 lr-rounded-full"
                style={{
                  backgroundColor: portal.navActiveColor,
                  width: 32,
                  left: '50%',
                  marginLeft: -16,
                  transition: 'all 0.2s ease',
                }}
              />
            )}
            <tab.Icon filled={isActive} />
            <span className="lr-text-[11px] lr-font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
