/**
 * Dynamic Icon Component
 * Maps known icon names to imported icons without pulling the entire library
 */

import React from 'react';
import {
  Home2,
  Box,
  Heart,
  Profile,
  DocumentText,
  Book,
  MessageQuestion,
  Chart,
} from 'iconsax-react';

interface DynamicIconProps {
  name: string;
  variant?: 'Bold' | 'Outline' | 'Bulk' | 'Linear' | 'Broken' | 'TwoTone';
  size?: number;
  className?: string;
  color?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home2,
  Package: Box,
  Heart,
  Profile,
  DocumentText,
  Book,
  MessageQuestion,
  Chart,
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  variant = 'Outline', 
  size = 24, 
  className = '', 
  color 
}) => {
  const IconComponent = ICON_MAP[name] || DocumentText;
  return <IconComponent variant={variant} size={size} className={className} color={color} />;
};

export default DynamicIcon;
