import { HelpTooltip } from '@components/ui/HelpTooltip';
import { useTranslation } from 'react-i18next';

export function TooltipTestPage() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Tooltip Test Page</h1>
      
      <div className="space-y-8">
        {/* Test different positions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Position Tests</h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 font-medium">Top Position:</p>
              <div className="flex items-center gap-2">
                <span>Test Content</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" position="top" />
              </div>
            </div>
            
            <div>
              <p className="mb-2 font-medium">Bottom Position:</p>
              <div className="flex items-center gap-2">
                <span>Test Content</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" position="bottom" />
              </div>
            </div>
            
            <div>
              <p className="mb-2 font-medium">Left Position:</p>
              <div className="flex items-center gap-2">
                <span>Test Content</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" position="left" />
              </div>
            </div>
            
            <div>
              <p className="mb-2 font-medium">Right Position:</p>
              <div className="flex items-center gap-2">
                <span>Test Content</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" position="right" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Test different sizes */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Size Tests</h2>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span>Small:</span>
              <HelpTooltip helpKey="dashboard.stats.totalUsers" iconSize="sm" />
            </div>
            
            <div className="flex items-center gap-2">
              <span>Medium:</span>
              <HelpTooltip helpKey="dashboard.stats.totalUsers" iconSize="md" />
            </div>
            
            <div className="flex items-center gap-2">
              <span>Large:</span>
              <HelpTooltip helpKey="dashboard.stats.totalUsers" iconSize="lg" />
            </div>
          </div>
        </div>
        
        {/* Test in table */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Table Context Test</h2>
          
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">
                  <div className="flex items-center gap-1">
                    <span>Column 1</span>
                    <HelpTooltip helpKey="content.columns.content" />
                  </div>
                </th>
                <th className="text-left py-2">
                  <div className="flex items-center gap-1">
                    <span>Column 2</span>
                    <HelpTooltip helpKey="content.columns.game" />
                  </div>
                </th>
                <th className="text-left py-2">
                  <div className="flex items-center gap-1">
                    <span>Column 3</span>
                    <HelpTooltip helpKey="content.columns.status" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">Row 1 Data 1</td>
                <td className="py-2">Row 1 Data 2</td>
                <td className="py-2">Row 1 Data 3</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Language toggle */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Language Test</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-4 py-2 rounded ${i18n.language === 'en' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              English
            </button>
            <button
              onClick={() => i18n.changeLanguage('ar')}
              className={`px-4 py-2 rounded ${i18n.language === 'ar' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              العربية
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span>{t('dashboard.stats.totalUsers')}</span>
            <HelpTooltip helpKey="dashboard.stats.totalUsers" />
          </div>
        </div>
        
        {/* Edge cases */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Edge Cases</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Far Left Edge</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" />
              </div>
              
              <div className="flex items-center gap-2">
                <span>Far Right Edge</span>
                <HelpTooltip helpKey="dashboard.stats.totalUsers" />
              </div>
            </div>
            
            <div className="h-96 overflow-auto border border-gray-300 dark:border-gray-700 rounded p-4">
              <div className="h-[600px] flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span>Top of scrollable area</span>
                  <HelpTooltip helpKey="dashboard.stats.totalUsers" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Bottom of scrollable area</span>
                  <HelpTooltip helpKey="dashboard.stats.totalUsers" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}