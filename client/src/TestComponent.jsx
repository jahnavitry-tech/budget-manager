import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Frontend is Working!</h1>
      <p>If you can see this, React is rendering properly.</p>
      <div style={{ 
        backgroundColor: '#4361ee', 
        color: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        Budget Manager Test Component
      </div>
    </div>
  );
};

export default TestComponent;