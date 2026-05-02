
import React from 'react';
import { TABS, TabType, Content } from '../types';

interface ContentTabsProps {
    currentTab: TabType;
    onTabChange: (tab: TabType) => void;
    contents: Content[];
}

export const ContentTabs: React.FC<ContentTabsProps> = ({ currentTab, onTabChange, contents }) => {
    return (
        <div className="mt-8 border-b border-gray-100 bg-white/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-16 lg:top-24 z-30 backdrop-blur-md">
            <nav className="mobile-tabs-container hide-scrollbar -mb-px flex space-x-6 sm:space-x-8" aria-label="Tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all
                            ${currentTab === tab.value
                                ? 'border-forest text-forest'
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'}
                        `}
                    >
                        {tab.name}
                        {tab.value !== 'all' && (
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-bold ${currentTab === tab.value ? 'bg-forest/10 text-forest' : 'bg-gray-100 text-gray-400'}`}>
                                {contents.filter(c => {
                                    if (tab.value === 'meditation') return c.type === 'meditation';
                                    if (tab.value === 'announcement') return c.type === 'announcement';
                                    if (tab.value === 'yoga_article') return c.category === 'yoga';
                                    if (tab.value === 'therapy_article') return c.category === 'therapy';
                                    return false;
                                }).length}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};
