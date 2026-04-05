export default function Logo() {
  return (
    <svg viewBox="0 0 500 120" className="w-[350px] md:w-[400px] h-auto drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            .jnm { font-family: 'Inter', sans-serif; font-weight: 700; fill: #39FF14; }
            .jn { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: 0.2em; fill: #ffffff; }
            .mot { font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: 0.05em; fill: #ffffff; }
            .keep { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: 0.4em; fill: #39FF14; }
            .tiny { font-family: 'monospace'; font-size: 8px; letter-spacing: 0.2em; fill: #39FF14; }
          `}
        </style>
      </defs>
      
      {/* Background */}
      <rect width="500" height="120" fill="#0b0f0b" />
      
      {/* Split Diagonal Line */}
      <line x1="0" y1="120" x2="200" y2="0" stroke="#39FF14" strokeWidth="2" />

      {/* J N M (stepped diagonally) */}
      <text x="60" y="55" fontSize="48" className="jnm">J</text>
      <text x="120" y="75" fontSize="36" className="jnm">N</text>
      <text x="175" y="95" fontSize="24" className="jnm" opacity="0.4">M</text>

      {/* Text on right side */}
      <text x="210" y="45" fontSize="16" className="jn">JUST NEED</text>
      <text x="208" y="82" fontSize="40" className="mot">MOTIVATION</text>
      <text x="245" y="105" fontSize="10" className="keep">KEEP GOING</text>
    </svg>
  );
}
