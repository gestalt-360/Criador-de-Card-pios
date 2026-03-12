import React, { useState } from 'react';
import { MenuData, MenuCategory, MenuItem, Addon } from '../types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, ChevronDown, ChevronUp, Upload, Link, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { publishToGithub } from '../services/github';

interface MenuEditorProps {
  menu: MenuData;
  setMenu: React.Dispatch<React.SetStateAction<MenuData>>;
}

export default function MenuEditor({ menu, setMenu }: MenuEditorProps) {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('meu-cardapio');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessUrl, setPublishSuccessUrl] = useState('');
  const [publishError, setPublishError] = useState('');
  
  const updateMenu = (updates: Partial<MenuData>) => {
    setMenu(prev => ({ ...prev, ...updates }));
  };

  const updateTheme = (key: keyof MenuData['theme'], value: string) => {
    setMenu(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError('');
    try {
      const url = await publishToGithub(githubToken, repoName, menu);
      setPublishSuccessUrl(url);
    } catch (err: any) {
      setPublishError(err.message || 'Erro desconhecido ao publicar.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenPublishModal = () => {
    const slug = menu.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .substring(0, 100);
    setRepoName(slug || 'meu-cardapio');
    setShowPublishModal(true);
  };

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: crypto.randomUUID(),
      name: 'Nova Categoria',
      items: []
    };
    updateMenu({ categories: [...menu.categories, newCategory] });
  };

  const updateCategory = (id: string, name: string) => {
    updateMenu({
      categories: menu.categories.map(c => c.id === id ? { ...c, name } : c)
    });
  };

  const deleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      updateMenu({
        categories: menu.categories.filter(c => c.id !== id)
      });
    }
  };

  const addItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: 'Novo Item',
      description: '',
      price: 0,
      imageUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/400/300`,
      addons: []
    };
    updateMenu({
      categories: menu.categories.map(c => 
        c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c
      )
    });
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<MenuItem>) => {
    updateMenu({
      categories: menu.categories.map(c => 
        c.id === categoryId ? {
          ...c,
          items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
        } : c
      )
    });
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      updateMenu({
        categories: menu.categories.map(c => 
          c.id === categoryId ? {
            ...c,
            items: c.items.filter(i => i.id !== itemId)
          } : c
        )
      });
    }
  };

  const addAddon = (categoryId: string, itemId: string) => {
    const newAddon: Addon = { id: crypto.randomUUID(), name: 'Novo Adicional', price: 0 };
    updateMenu({
      categories: menu.categories.map(c => 
        c.id === categoryId ? {
          ...c,
          items: c.items.map(i => i.id === itemId ? { ...i, addons: [...i.addons, newAddon] } : i)
        } : c
      )
    });
  };

  const updateAddon = (categoryId: string, itemId: string, addonId: string, updates: Partial<Addon>) => {
    updateMenu({
      categories: menu.categories.map(c => 
        c.id === categoryId ? {
          ...c,
          items: c.items.map(i => i.id === itemId ? {
            ...i,
            addons: i.addons.map(a => a.id === addonId ? { ...a, ...updates } : a)
          } : i)
        } : c
      )
    });
  };

  const deleteAddon = (categoryId: string, itemId: string, addonId: string) => {
    updateMenu({
      categories: menu.categories.map(c => 
        c.id === categoryId ? {
          ...c,
          items: c.items.map(i => i.id === itemId ? {
            ...i,
            addons: i.addons.filter(a => a.id !== addonId)
          } : i)
        } : c
      )
    });
  };

  // Image Upload Simulation
  const handleImageUrl = (categoryId: string, itemId: string) => {
    const url = prompt("Cole a URL da imagem (ou deixe em branco para uma imagem aleatória):");
    if (url !== null) {
      updateItem(categoryId, itemId, { imageUrl: url || `https://picsum.photos/seed/${crypto.randomUUID()}/400/300` });
    }
  };

  const handleImageFile = (categoryId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(categoryId, itemId, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrl = () => {
    const url = prompt("Cole a URL da logo (ou deixe em branco para uma aleatória):");
    if (url !== null) {
      updateMenu({ logoUrl: url || `https://picsum.photos/seed/${crypto.randomUUID()}/200/200` });
    }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMenu({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Basic Info */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Informações Básicas</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden relative group shrink-0">
              {menu.logoUrl ? (
                <img src={menu.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-xs text-slate-500 font-mono">Logo</span>
                </>
              )}
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <label className="cursor-pointer bg-cyan-500 text-slate-950 px-2 py-1.5 rounded text-xs font-bold hover:bg-cyan-400 w-20 text-center flex items-center justify-center gap-1 transition-colors">
                  <Upload className="w-3 h-3" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                </label>
                <button onClick={handleLogoUrl} className="bg-slate-700 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-slate-600 w-20 text-center flex items-center justify-center gap-1 transition-colors">
                  <Link className="w-3 h-3" /> URL
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 font-mono">Nome do Estabelecimento</label>
                <input 
                  type="text" 
                  value={menu.name} 
                  onChange={e => updateMenu({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 font-mono">Descrição</label>
                <input 
                  type="text" 
                  value={menu.description} 
                  onChange={e => updateMenu({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 font-mono">WhatsApp para Pedidos (apenas números)</label>
                <input 
                  type="text" 
                  value={menu.whatsappNumber} 
                  onChange={e => updateMenu({ whatsappNumber: e.target.value })}
                  placeholder="Ex: 5511999999999"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Aparência</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">Cor Primária</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={menu.theme.primaryColor} 
                onChange={e => updateTheme('primaryColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-sm text-slate-300 uppercase font-mono">{menu.theme.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">Fundo</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={menu.theme.backgroundColor} 
                onChange={e => updateTheme('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-sm text-slate-300 uppercase font-mono">{menu.theme.backgroundColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">Texto</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={menu.theme.textColor} 
                onChange={e => updateTheme('textColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-sm text-slate-300 uppercase font-mono">{menu.theme.textColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">Fonte</label>
            <select 
              value={menu.theme.fontFamily}
              onChange={e => updateTheme('fontFamily', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="Inter">Inter (Moderna)</option>
              <option value="serif">Serif (Clássica)</option>
              <option value="monospace">Mono (Descolada)</option>
              <option value="system-ui">Sistema</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories & Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Cardápio</h2>
          <button 
            onClick={addCategory}
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors border border-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
        </div>

        {menu.categories.map((category, catIndex) => (
          <div key={category.id} className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
            {/* Category Header */}
            <div className="bg-slate-800/50 border-b border-slate-800 p-4 flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
              <input 
                type="text" 
                value={category.name}
                onChange={e => updateCategory(category.id, e.target.value)}
                className="flex-1 bg-transparent font-semibold text-slate-100 border-none focus:ring-0 p-0 text-lg placeholder-slate-600 outline-none"
                placeholder="Nome da Categoria"
              />
              <button 
                onClick={() => deleteCategory(category.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Excluir Categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={item.id} className="border border-slate-800 rounded-xl p-4 relative group bg-slate-950 hover:border-cyan-500/50 transition-colors">
                  <button 
                    onClick={() => deleteItem(category.id, item.id)}
                    className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 shrink-0 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative group/img">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm">
                        <label className="cursor-pointer bg-cyan-500 text-slate-950 px-2 py-1.5 rounded text-xs font-bold hover:bg-cyan-400 w-20 text-center flex items-center justify-center gap-1 transition-colors">
                          <Upload className="w-3 h-3" /> Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(category.id, item.id, e)} />
                        </label>
                        <button onClick={() => handleImageUrl(category.id, item.id)} className="bg-slate-700 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-slate-600 w-20 text-center flex items-center justify-center gap-1 transition-colors">
                          <Link className="w-3 h-3" /> URL
                        </button>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-3 pr-8">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={e => updateItem(category.id, item.id, { name: e.target.value })}
                          className="flex-1 font-medium text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:ring-0 px-0 py-1 transition-colors outline-none placeholder-slate-600"
                          placeholder="Nome do Produto"
                        />
                        <div className="relative flex items-center">
                          <span className="absolute left-2 text-slate-500 text-sm font-mono">R$</span>
                          <input 
                            type="number" 
                            value={item.price || ''}
                            onChange={e => updateItem(category.id, item.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-24 pl-8 pr-2 py-1 font-medium text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:ring-0 transition-colors outline-none text-right font-mono placeholder-slate-600"
                            placeholder="0,00"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <textarea 
                          value={item.description}
                          onChange={e => updateItem(category.id, item.id, { description: e.target.value })}
                          className="w-full text-sm text-slate-400 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-md px-2 py-1.5 transition-colors outline-none resize-none h-16 placeholder-slate-600"
                          placeholder="Descrição do produto..."
                        />
                      </div>

                      {/* Addons */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Adicionais</span>
                          <button 
                            onClick={() => addAddon(category.id, item.id)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Adicionar
                          </button>
                        </div>
                        
                        {item.addons.length > 0 && (
                          <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                            {item.addons.map(addon => (
                              <div key={addon.id} className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={addon.name}
                                  onChange={e => updateAddon(category.id, item.id, addon.id, { name: e.target.value })}
                                  className="flex-1 text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 focus:border-cyan-500 outline-none placeholder-slate-600"
                                  placeholder="Nome do adicional"
                                />
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 text-slate-500 text-xs font-mono">R$</span>
                                  <input 
                                    type="number" 
                                    value={addon.price || ''}
                                    onChange={e => updateAddon(category.id, item.id, addon.id, { price: parseFloat(e.target.value) || 0 })}
                                    className="w-20 pl-6 pr-2 py-1 text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded focus:border-cyan-500 outline-none text-right font-mono placeholder-slate-600"
                                    placeholder="0,00"
                                    step="0.01"
                                  />
                                </div>
                                <button 
                                  onClick={() => deleteAddon(category.id, item.id, addon.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => addItem(category.id)}
                className="w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-medium hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Produto
              </button>
            </div>
          </div>
        ))}

        {menu.categories.length === 0 && (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-500 mb-4 font-mono">Nenhuma categoria adicionada ainda.</p>
            <button 
              onClick={addCategory}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-6 py-2 rounded-xl font-bold transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Criar Primeira Categoria
            </button>
          </div>
        )}
      </div>

      {/* Footer / Publish Button */}
      <div className="pt-8 pb-4 border-t border-slate-800 mt-8">
        <button 
          onClick={handleOpenPublishModal}
          className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
        >
          <Globe className="w-5 h-5" />
          Concluir e Publicar
        </button>
        <p className="text-center text-xs text-slate-500 mt-3 font-mono">
          Clique aqui para colocar seu cardápio online.
        </p>
      </div>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
              onClick={() => !isPublishing && setShowPublishModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm rounded-3xl p-6 z-50 shadow-2xl bg-slate-900 border border-slate-800 text-slate-200"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2 text-white">Publicar</h2>
              
              {publishSuccessUrl ? (
                <div className="text-center">
                  <p className="text-green-400 mb-4">Cardápio publicado com sucesso!</p>
                  <a href={publishSuccessUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline break-all mb-6 block">
                    {publishSuccessUrl}
                  </a>
                  <p className="text-xs text-slate-400 mb-6">Pode levar alguns minutos para o link ficar online pela primeira vez.</p>
                  <button 
                    onClick={() => setShowPublishModal(false)} 
                    className="w-full py-3 rounded-xl font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-slate-400 text-sm mb-4 leading-relaxed">
                    Publique seu cardápio gratuitamente no GitHub Pages.
                  </p>
                  
                  {publishError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4">
                      {publishError}
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Código</label>
                      <input 
                        type="password" 
                        value={githubToken}
                        onChange={e => setGithubToken(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                        placeholder="ghp_..."
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Precisa ter permissão de "repo" e "workflow".</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Cardápio</label>
                      <input 
                        type="text" 
                        value={repoName}
                        onChange={e => setRepoName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                        placeholder="meu-cardapio"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPublishModal(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                      disabled={isPublishing}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handlePublish}
                      disabled={isPublishing || !githubToken || !repoName}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
