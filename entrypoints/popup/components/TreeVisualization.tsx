import { getUserStats, updateTokenSavings } from '@/entrypoints/shared/StatsService';
import React, { useState, useEffect } from 'react';

interface TreeVisualizationProps {
  refreshTrigger?: number; // Optional prop to force refresh
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<{
    totalTokensSaved: number;
    treesGrown: number;
    carbonSaved: number;
  }>({
    totalTokensSaved: 0,
    treesGrown: 0,
    carbonSaved: 0
  });
  
  const [treeSize, setTreeSize] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  
  // Load stats when component mounts or refreshTrigger or localRefreshTrigger changes
  useEffect(() => {
    async function loadStats() {
      const userStats = await getUserStats();
      setStats({
        totalTokensSaved: userStats.totalTokensSaved,
        treesGrown: userStats.treesGrown,
        carbonSaved: userStats.carbonSaved
      });
      
      // Calculate tree growth based on tokens saved
      // Tree grows from size 1 to 8 based on progress toward next tree
      const nextTreeProgress = userStats.totalTokensSaved % 100; // For demo: changed from 10000 to 100
      const growthPercentage = nextTreeProgress / 100; // For demo: changed from 10000 to 100
      setTreeSize(1 + Math.min(5 * growthPercentage, 8)); // More dramatic growth
    }
    
    loadStats();
  }, [refreshTrigger, localRefreshTrigger]);
  
  // Function to format carbon savings
  const formatCarbonSaving = (grams: number) => {
    if (grams < 1000) {
      return `${grams.toFixed(0)}g`;
    } else {
      const kg = grams / 1000;
      return `${kg.toFixed(1)}kg`;
    }
  };
  
  // Make tree color change with growth
  const treeColor = treeSize < 3 
    ? "#90EE90" // Light green for small trees
    : treeSize < 6 
      ? "#32CD32" // Medium green
      : "#006400"; // Dark green for mature trees
  
  // Calculate container height based on tree size - more aggressive scaling
  // The scaling factor is now higher to prevent cropping
  const containerHeight = 140 + (treeSize * 15); // Increased base height and multiplier
  
  return (
    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-100">
      <h3 
        className="text-lg font-medium text-green-800 mb-2">
        Your Impact
      </h3>
      
      {/* Tree SVG - with adjusted container size and better viewBox */}
      <div 
        className="my-4 relative w-full flex items-center justify-center"
        style={{ 
          height: `${containerHeight}px`,
          maxWidth: '200px', // Increased max width
          transition: 'height 0.5s ease-out', // Smooth transition for height changes
          overflow: 'visible' // Allow content to overflow the container
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 120" // Increased viewBox size for better scaling
          preserveAspectRatio="xMidYMax meet" // Keep the bottom of the tree always visible
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }} // Allow SVG elements to extend beyond the SVG container
        >
          {/* Adjust vertical positioning by adding a transform */}
          <g transform={`translate(0, ${treeSize > 6 ? 20 : 0})`}>
            {/* Tree trunk - gets taller and wider with growth */}
            <rect
              x={60 - (2 + treeSize)}
              y={90 - treeSize * 14}
              width={4 + treeSize * 2}
              height={20 + treeSize * 14}
              fill={`rgb(139, ${69 + treeSize * 10}, 19)`} // Trunk gets lighter as tree grows
            />
            
            {/* Ground */}
            <ellipse cx="60" cy="105" rx="40" ry="5" fill="#8B4513" opacity="0.6" />
            
            {/* Tree foliage - grows more dramatically with tree size */}
            <circle
              cx="60"
              cy={80 - treeSize * 8}
              r={5 + treeSize * 6}
              fill={treeColor}
            />
            <circle
              cx={50 - treeSize * 3}
              cy={85 - treeSize * 8}
              r={4 + treeSize * 5}
              fill={treeColor}
            />
            <circle
              cx={70 + treeSize * 3}
              cy={85 - treeSize * 8}
              r={4 + treeSize * 5}
              fill={treeColor}
            />
            
            {/* Add extra foliage as the tree grows */}
            {treeSize > 3 && (
              <>
                <circle
                  cx={45 - treeSize * 2}
                  cy={90 - treeSize * 7}
                  r={3 + treeSize * 3}
                  fill={treeColor}
                />
                <circle
                  cx={75 + treeSize * 2}
                  cy={90 - treeSize * 7}
                  r={3 + treeSize * 3}
                  fill={treeColor}
                />
              </>
            )}
            
            {/* Add even more foliage for larger trees */}
            {treeSize > 6 && (
              <>
                <circle
                  cx="60"
                  cy={65 - treeSize * 6}
                  r={4 + treeSize * 3}
                  fill={treeColor}
                />
                <circle
                  cx={40 - treeSize}
                  cy={75 - treeSize * 6}
                  r={3 + treeSize * 2}
                  fill={treeColor}
                />
                <circle
                  cx={80 + treeSize}
                  cy={75 - treeSize * 6}
                  r={3 + treeSize * 2}
                  fill={treeColor}
                />
              </>
            )}
          </g>
        </svg>
        
        {/* Growth sparkles - positioned according to transformed tree */}
        {treeSize > 1 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            {Array.from({ length: Math.floor(treeSize * 4) }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-300 rounded-full animate-ping"
                style={{
                  width: `${Math.max(3, treeSize / 2)}px`,
                  height: `${Math.max(3, treeSize / 2)}px`,
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.8 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Stats display */}
      <div className="w-full grid grid-cols-2 gap-2 text-center text-sm">
        <div className="bg-white p-2 rounded border border-green-100">
          <div className="font-bold text-green-700">{stats.totalTokensSaved.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Tokens Saved</div>
        </div>
        
        <div className="bg-white p-2 rounded border border-green-100">
          <div className="font-bold text-green-700">{stats.treesGrown}</div>
          <div className="text-xs text-gray-600">Trees Grown</div>
        </div>
        
        <div className="bg-white p-2 rounded border border-green-100 col-span-2">
          <div className="font-bold text-green-700">{formatCarbonSaving(stats.carbonSaved)}</div>
          <div className="text-xs text-gray-600">CO₂ Emissions Reduced</div>
        </div>
      </div>
      
      {/* Progress to next tree */}
      <div className="w-full mt-2">
        <div className="text-xs text-center mb-1">
          {stats.totalTokensSaved % 100 === 0 ? (
            <span className="text-green-700 font-medium">Tree completed! 🎉</span>
          ) : (
            <span>
              {(100 - (stats.totalTokensSaved % 100)).toLocaleString()} tokens until next tree
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(stats.totalTokensSaved % 100)}%` }}
          />
        </div>
      </div>
      
      {/* Environmental impact explainer */}
      <div className="mt-3 text-xs text-gray-600 text-center">
        <p>Every 100 tokens saved helps reduce AI computing resources.</p>
      </div>
      
      {/* Hidden demo button that appears when clicking the impact heading 5 times */}
      {/* {demoMode && (
        <button
          className="mt-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded text-gray-700"
          onClick={async () => {
            // Add 10 tokens each time for quick demo
            await updateTokenSavings(10);
            // Use local trigger instead
            setLocalRefreshTrigger(prev => prev + 1);
          }}
        >
          +10 Tokens (Demo)
        </button>
      )} */}
    </div>
  );
};

export default TreeVisualization;