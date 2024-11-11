import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

const TooltipButton = ({ onClick, icon, tooltip, isActive = false }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button 
          onClick={onClick ? () => onClick() : undefined} 
          className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg"
          sideOffset={5}
        >
          {tooltip}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default TooltipButton;
