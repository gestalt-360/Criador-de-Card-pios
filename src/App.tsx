import React, { useState } from 'react';
import { MenuData } from './types';
import MenuEditor from './components/MenuEditor';
import MenuPreview from './components/MenuPreview';
import { Smartphone, Settings, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const initialMenu: MenuData = {
  name: "Cyber Burger",
  description: "Hambúrgueres artesanais do futuro, feitos com paixão e ingredientes frescos.",
  logoUrl: "https://picsum.photos/seed/cyberburger/200/200",
  whatsappNumber: "5511999999999",
  theme: {
    primaryColor: "#06b6d4", // Cyan 500
    backgroundColor: "#0f172a", // Slate 900
    textColor: "#f8fafc", // Slate 50
    fontFamily: "monospace"
  },
  categories: [
    {
      id: "cat-1",
      name: "Clássicos",
      items: [
        {
          id: "item-1",
          name: "Cheeseburger Duplo",
          description: "Dois blends de 150g, muito queijo cheddar, cebola caramelizada e nosso molho especial no pão brioche.",
          price: 34.90,
          imageUrl: "https://picsum.photos/seed/cheeseburger/400/300",
          addons: [
            { id: "add-1", name: "Bacon Crocante", price: 5.00 },
            { id: "add-2", name: "Extra Cheddar", price: 3.50 }
          ]
        },
        {
          id: "item-2",
          name: "Smash Burger",
          description: "Blend de 100g prensado na chapa, queijo prato, picles e mostarda no pão de batata.",
          price: 22.90,
          imageUrl: "https://picsum.photos/seed/smash/400/300",
          addons: []
        }
      ]
    },
    {
      id: "cat-2",
      name: "Acompanhamentos",
      items: [
        {
          id: "item-3",
          name: "Batata Rústica",
          description: "Porção de batatas rústicas temperadas com páprica e alecrim. Acompanha maionese da casa.",
          price: 18.90,
          imageUrl: "https://picsum.photos/seed/fries/400/300",
          addons: [
            { id: "add-3", name: "Cheddar e Bacon", price: 8.00 }
          ]
        }
      ]
    }
  ]
};

export default function App() {
  const [menu, setMenu] = useState<MenuData>(initialMenu);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Criador de Cardápio Virtual</h1>
          </div>
          
          {/* Mobile Tabs */}
          <div className="flex lg:hidden bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'editor' ? 'bg-slate-800 shadow-sm text-cyan-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Settings className="w-4 h-4" /> Editar
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'bg-slate-800 shadow-sm text-cyan-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Smartphone className="w-4 h-4" /> Ver
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Editor */}
        <div className={`flex-1 flex flex-col gap-6 ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Editor Component */}
          <MenuEditor menu={menu} setMenu={setMenu} />
        </div>

        {/* Right Column: Preview */}
        <div className={`lg:w-[400px] xl:w-[450px] shrink-0 ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'} flex-col items-center`}>
          <div className="sticky top-24 w-full flex flex-col items-center">
            <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-widest mb-4 hidden lg:block font-mono">Preview ao Vivo</h2>
            
            {/* Phone Mockup */}
            <div className="relative w-full max-w-[375px] h-[812px] bg-slate-950 rounded-[3rem] p-3 shadow-[0_0_50px_rgba(6,182,212,0.1)] border-4 border-slate-800 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 rounded-b-3xl w-40 mx-auto z-20"></div>
              
              {/* Screen */}
              <div className="bg-slate-900 w-full h-full rounded-[2.25rem] overflow-hidden relative border border-slate-800">
                <MenuPreview menu={menu} />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
