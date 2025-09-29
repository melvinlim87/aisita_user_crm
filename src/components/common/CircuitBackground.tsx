import React from 'react';
import { VerticalCircuitLines } from './VerticalCircuitLines';

const CircuitBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <VerticalCircuitLines theme="light" />
    </div>
  );
};

export default CircuitBackground;