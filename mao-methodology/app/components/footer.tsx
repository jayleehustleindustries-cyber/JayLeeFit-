'use client';

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t operator-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold operator-accent mb-4">MAO Methodology</h3>
            <p className="text-gray-400 text-sm">Elite macro optimization fitness coaching system.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-amber-400">Coaching</a></li>
              <li><a href="#ai-engine" className="hover:text-amber-400">AI Engine</a></li>
              <li><a href="#sample-split" className="hover:text-amber-400">Sample Split</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#coach-jay" className="hover:text-amber-400">Coach Jay</a></li>
              <li><a href="#proof" className="hover:text-amber-400">Proof</a></li>
              <li><a href="#gallery" className="hover:text-amber-400">Gallery</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-4">Contact</h4>
            <p className="text-sm text-gray-400">
              <a href="mailto:contact@mao.fit" className="hover:text-amber-400">contact@mao.fit</a>
            </p>
          </div>
        </div>
        <div className="border-t operator-border pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 MAO Methodology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
