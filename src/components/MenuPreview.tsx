import React, { useState } from 'react';
import { MenuData, MenuItem, Addon } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus, ShoppingBag, CheckCircle2, Trash2, Send } from 'lucide-react';

interface MenuPreviewProps {
  menu: MenuData;
}

interface CartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  addons: Addon[];
  total: number;
}

export default function MenuPreview({ menu }: MenuPreviewProps) {
  const [activeCategory, setActiveCategory] = useState<string>(menu.categories[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  React.useEffect(() => {
    if (!menu.categories.find(c => c.id === activeCategory)) {
      setActiveCategory(menu.categories[0]?.id || '');
    }
  }, [menu.categories, activeCategory]);

  React.useEffect(() => {
    setSelectedAddons(new Set());
    setQuantity(1);
  }, [selectedItem]);

  const toggleAddon = (addonId: string) => {
    const newSet = new Set(selectedAddons);
    if (newSet.has(addonId)) {
      newSet.delete(addonId);
    } else {
      newSet.add(addonId);
    }
    setSelectedAddons(newSet);
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    let total = selectedItem.price;
    selectedItem.addons.forEach(addon => {
      if (selectedAddons.has(addon.id)) {
        total += addon.price;
      }
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    const addonsToAdd = selectedItem.addons.filter(a => selectedAddons.has(a.id));
    
    const newCartItem: CartItem = {
      id: crypto.randomUUID(),
      item: selectedItem,
      quantity,
      addons: addonsToAdd,
      total: calculateTotal()
    };

    setCart([...cart, newCartItem]);
    setSelectedItem(null);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    
    cart.forEach(cartItem => {
      message += `${cartItem.quantity}x ${cartItem.item.name} - ${formatPrice(cartItem.total)}\n`;
      if (cartItem.addons.length > 0) {
        message += `   Adicionais: ${cartItem.addons.map(a => a.name).join(', ')}\n`;
      }
    });

    message += `\n*Total: ${formatPrice(cartTotal)}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${menu.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Helper to format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  // Dynamic styles based on theme
  const themeStyles = {
    '--primary': menu.theme.primaryColor,
    '--bg': menu.theme.backgroundColor,
    '--text': menu.theme.textColor,
    fontFamily: menu.theme.fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      className="w-full h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide"
      style={{ ...themeStyles, backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header / Cover */}
      <div className="relative h-48 flex items-end justify-center pb-6" style={{ backgroundColor: 'var(--primary)' }}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {menu.logoUrl && (
            <img 
              src={menu.logoUrl} 
              alt={menu.name} 
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 object-cover bg-white"
              referrerPolicy="no-referrer"
            />
          )}
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{menu.name}</h1>
          <p className="text-white/90 text-sm mt-1 drop-shadow-sm max-w-[280px] line-clamp-2">{menu.description}</p>
        </div>
      </div>

      {/* Categories Navigation (Sticky) */}
      <div className="sticky top-0 z-20 shadow-sm backdrop-blur-md border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-3">
          {menu.categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id 
                  ? 'shadow-md' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeCategory === category.id ? 'var(--primary)' : 'transparent',
                color: activeCategory === category.id ? '#fff' : 'var(--text)',
                border: activeCategory === category.id ? 'none' : '1px solid currentColor'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-8 pb-24">
        {menu.categories.map(category => (
          <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-16">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {category.name}
              <div className="h-px flex-1 opacity-20" style={{ backgroundColor: 'var(--text)' }}></div>
            </h2>
            
            <div className="space-y-4">
              {category.items.map(item => (
                <div 
                  key={item.id} 
                  className="flex gap-3 rounded-2xl p-3 shadow-sm border cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-base leading-tight mb-1">{item.name}</h3>
                      <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-2 font-medium" style={{ color: 'var(--primary)' }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  {item.imageUrl && (
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' }}>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {menu.categories.length === 0 && (
          <div className="text-center py-10 opacity-50 text-sm">
            O cardápio está vazio.
          </div>
        )}
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[90%]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-2" onClick={() => setSelectedItem(null)}>
                <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 20%, transparent)' }}></div>
              </div>

              <div className="overflow-y-auto flex-1 pb-24">
                {selectedItem.imageUrl && (
                  <div className="w-full h-56 relative" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' }}>
                    <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h2 className="text-2xl font-bold leading-tight">{selectedItem.name}</h2>
                    <span className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--primary)' }}>
                      {formatPrice(selectedItem.price)}
                    </span>
                  </div>
                  <p className="text-sm opacity-80 leading-relaxed mb-6">{selectedItem.description}</p>

                  {selectedItem.addons.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' }}>
                        Adicionais
                        <span className="text-xs font-normal opacity-60">Opcional</span>
                      </h3>
                      <div className="space-y-3 px-1">
                        {selectedItem.addons.map(addon => {
                          const isSelected = selectedAddons.has(addon.id);
                          return (
                            <label key={addon.id} className="flex items-center justify-between cursor-pointer group" onClick={() => toggleAddon(addon.id)}>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors" 
                                  style={{ 
                                    borderColor: isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--text) 20%, transparent)',
                                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent'
                                  }}
                                >
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className="text-sm font-medium">{addon.name}</span>
                              </div>
                              <span className="text-sm opacity-70">+ {formatPrice(addon.price)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Cart Footer */}
              <div className="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md border-t" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)', borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
                <div className="flex gap-3">
                  <div className="flex items-center justify-between rounded-2xl px-3 w-28" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' }}>
                    <button 
                      className="p-2 opacity-50 hover:opacity-100 disabled:opacity-20" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium">{quantity}</span>
                    <button 
                      className="p-2 opacity-50 hover:opacity-100"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    className="flex-1 rounded-2xl py-3.5 font-semibold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar • {formatPrice(calculateTotal())}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !selectedItem && !isCartOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 inset-x-4 z-30"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-between px-6 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </div>
                <span>Ver Carrinho</span>
              </div>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[90%] h-[80%]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-2" onClick={() => setIsCartOpen(false)}>
                <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 20%, transparent)' }}></div>
              </div>

              <div className="p-5 border-b" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
                <h2 className="text-2xl font-bold">Seu Pedido</h2>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4 pb-24">
                {cart.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    Seu carrinho está vazio.
                  </div>
                ) : (
                  cart.map(cartItem => (
                    <div key={cartItem.id} className="flex gap-3 pb-4 border-b last:border-0" style={{ borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-medium text-sm shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' }}>
                        {cartItem.quantity}x
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold leading-tight">{cartItem.item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(cartItem.id)}
                            className="p-1 opacity-50 hover:opacity-100 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {cartItem.addons.length > 0 && (
                          <p className="text-xs opacity-60 mt-1 line-clamp-2">
                            Com: {cartItem.addons.map(a => a.name).join(', ')}
                          </p>
                        )}
                        <div className="mt-2 font-medium" style={{ color: 'var(--primary)' }}>
                          {formatPrice(cartItem.total)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Footer */}
              <div className="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md border-t" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)', borderColor: 'color-mix(in srgb, var(--text) 10%, transparent)' }}>
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{formatPrice(cartTotal)}</span>
                </div>
                <button 
                  className="w-full rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !menu.whatsappNumber}
                >
                  <Send className="w-5 h-5" />
                  Fazer Pedido
                </button>
                {!menu.whatsappNumber && (
                  <p className="text-center text-xs text-red-400 mt-2">
                    O número de WhatsApp não foi configurado pelo estabelecimento.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
