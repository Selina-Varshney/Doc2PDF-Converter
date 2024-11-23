import React from 'react';

export default function Footer() {
    return (
      <footer
        className="flex flex-col items-center justify-center w-full  bg-orange-500 py-4"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
       
        <h1 className="text-center text-sm font-light text-white">
          Made with <span style={{ color: "white" }}>🤍</span> by{' '}
          <span className="font-semibold text-white">Selina Varshney</span>
        </h1>
      </footer>
    );
  }
  