import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * FlashFusion Brand Guide Component
 * Comprehensive documentation of brand colors, styles, and usage
 */
export default function BrandGuide() {
  const colors = {
    primary: [
      { name: 'Primary Purple', hex: '#8b85f7', class: 'bg-[#8b85f7]' },
      { name: 'Deep Purple', hex: '#583cf0', class: 'bg-[#583cf0]' },
      { name: 'Light Purple', hex: '#9a95ff', class: 'bg-[#9a95ff]' }
    ],
    secondary: [
      { name: 'Deep Navy', hex: '#0f0618', class: 'bg-[#0f0618]' },
      { name: 'Lighter Navy', hex: '#2d1e50', class: 'bg-[#2d1e50]' }
    ],
    accent: [
      { name: 'Cyan', hex: '#00b7eb', class: 'bg-[#00b7eb]' },
      { name: 'Orange', hex: '#ff8e42', class: 'bg-[#ff8e42]' },
      { name: 'Pink', hex: '#ff69b4', class: 'bg-[#ff69b4]' }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">FlashFusion Brand Guide</h1>
        <p className="text-[#64748b]">Comprehensive brand system and design guidelines</p>
      </div>

      {/* Colors */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-gradient">Brand Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(colors).map(([category, colorList]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-[#8b85f7] mb-3 uppercase">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colorList.map((color) => (
                  <div key={color.hex} className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-xl ${color.class} border-2 border-[#2d1e50]`} />
                    <div>
                      <p className="font-medium text-white">{color.name}</p>
                      <p className="text-sm text-[#64748b]">{color.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gradients */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-gradient">Gradient Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 rounded-xl gradient-primary" />
          <div className="h-20 rounded-xl gradient-purple-cyan" />
          <div className="h-20 rounded-xl gradient-purple-pink" />
        </CardContent>
      </Card>

      {/* Components */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-gradient">Component Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#8b85f7] mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-tertiary">Tertiary Button</button>
              <button className="btn-ghost">Ghost Button</button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#8b85f7] mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="badge-primary">Primary</Badge>
              <Badge className="badge-success">Success</Badge>
              <Badge className="badge-warning">Warning</Badge>
              <Badge className="badge-error">Error</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#8b85f7] mb-3">Text Gradients</h3>
            <h2 className="text-3xl font-bold text-gradient mb-2">FlashFusion Platform</h2>
            <h3 className="text-2xl font-bold text-gradient-warm">Warm Gradient Text</h3>
          </div>
        </CardContent>
      </Card>

      {/* CSS Classes Reference */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-gradient">CSS Classes Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <p className="text-[#8b85f7] mb-2">Gradients:</p>
              <p className="text-[#94a3b8]">.gradient-primary, .gradient-purple-cyan, .gradient-purple-pink</p>
            </div>
            <div>
              <p className="text-[#8b85f7] mb-2">Text Gradients:</p>
              <p className="text-[#94a3b8]">.text-gradient, .text-gradient-warm</p>
            </div>
            <div>
              <p className="text-[#8b85f7] mb-2">Glow Effects:</p>
              <p className="text-[#94a3b8]">.glow-primary, .glow-cyan, .glow-orange, .glow-pink</p>
            </div>
            <div>
              <p className="text-[#8b85f7] mb-2">Cards:</p>
              <p className="text-[#94a3b8]">.card-dark, .card-darker</p>
            </div>
            <div>
              <p className="text-[#8b85f7] mb-2">Borders:</p>
              <p className="text-[#94a3b8]">.border-neon-purple, .border-neon-cyan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}