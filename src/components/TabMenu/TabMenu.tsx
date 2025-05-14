import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TabMenu.css';

type TabItem = {
  id: string;
  labelKey: string;
};

type TabMenuProps = {
  items: TabItem[];
  onTabChange?: (tabId: string) => void;
};

const TabMenu = ({ items, onTabChange }: TabMenuProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(items[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="tab-menu">
      <ul className="tab-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`tab-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
          >
            {t(item.labelKey)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabMenu;