import { MenuData } from '../types';

export const generateStandaloneHTML = (menu: MenuData): string => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${menu.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --primary: ${menu.theme.primaryColor};
            --bg: ${menu.theme.backgroundColor};
            --text: ${menu.theme.textColor};
        }
        body {
            font-family: ${menu.theme.fontFamily === 'monospace' ? 'monospace' : menu.theme.fontFamily === 'serif' ? 'serif' : 'system-ui, sans-serif'};
            background-color: var(--bg);
            color: var(--text);
            -webkit-tap-highlight-color: transparent;
        }
        /* Hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .modal-overlay {
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        
        .bottom-sheet {
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        }
        .bottom-sheet.active {
            transform: translateY(0);
        }
        
        .floating-cart {
            transform: translateY(150%);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        }
        .floating-cart.active {
            transform: translateY(0);
            opacity: 1;
        }
    </style>
</head>
<body class="antialiased">
    <div id="app" class="w-full h-full min-h-screen relative overflow-x-hidden">
        <!-- Header -->
        <div class="relative h-48 flex items-end justify-center pb-6" style="background-color: var(--primary)">
            <div class="absolute inset-0 bg-black/10"></div>
            <div class="relative z-10 flex flex-col items-center text-center px-4">
                ${menu.logoUrl ? `<img src="${menu.logoUrl}" alt="${menu.name}" class="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 object-cover bg-white" referrerpolicy="no-referrer" />` : ''}
                <h1 class="text-2xl font-bold text-white drop-shadow-md">${menu.name}</h1>
                <p class="text-white/90 text-sm mt-1 drop-shadow-sm max-w-[280px] line-clamp-2">${menu.description}</p>
            </div>
        </div>

        <!-- Categories Nav -->
        <div class="sticky top-0 z-20 shadow-sm backdrop-blur-md border-b" style="background-color: color-mix(in srgb, var(--bg) 80%, transparent); border-color: color-mix(in srgb, var(--text) 10%, transparent)">
            <div class="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-3" id="category-nav">
                ${menu.categories.map((cat, idx) => `
                    <button onclick="scrollToCategory('${cat.id}')" id="nav-${cat.id}" class="cat-nav-btn whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${idx === 0 ? 'shadow-md' : 'opacity-70 hover:opacity-100'}" style="${idx === 0 ? 'background-color: var(--primary); color: #fff; border: none;' : 'background-color: transparent; color: var(--text); border: 1px solid currentColor;'}">
                        ${cat.name}
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Menu Items -->
        <div class="p-4 space-y-8 pb-32">
            ${menu.categories.map(cat => `
                <div id="cat-${cat.id}" class="scroll-mt-16 category-section">
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                        ${cat.name}
                        <div class="h-px flex-1 opacity-20" style="background-color: var(--text)"></div>
                    </h2>
                    <div class="space-y-4">
                        ${cat.items.map(item => `
                            <div onclick="openItemModal('${item.id}')" class="flex gap-3 rounded-2xl p-3 shadow-sm border cursor-pointer active:scale-[0.98] transition-transform" style="background-color: color-mix(in srgb, var(--text) 5%, transparent); border-color: color-mix(in srgb, var(--text) 10%, transparent)">
                                <div class="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 class="font-semibold text-base leading-tight mb-1">${item.name}</h3>
                                        <p class="text-xs opacity-70 line-clamp-2 leading-relaxed">${item.description}</p>
                                    </div>
                                    <div class="mt-2 font-medium" style="color: var(--primary)">
                                        R$ ${item.price.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                                ${item.imageUrl ? `
                                <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden" style="background-color: color-mix(in srgb, var(--text) 5%, transparent)">
                                    <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                                </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            ${menu.categories.length === 0 ? `<div class="text-center py-10 opacity-50 text-sm">O cardápio está vazio.</div>` : ''}
        </div>

        <!-- Floating Cart Button -->
        <div id="floating-cart" class="floating-cart fixed bottom-6 inset-x-4 z-30">
            <button onclick="openCartModal()" class="w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-between px-6 active:scale-95 transition-transform" style="background-color: var(--primary)">
                <div class="flex items-center gap-3">
                    <div id="cart-badge" class="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">0</div>
                    <span>Ver Carrinho</span>
                </div>
                <span id="cart-total-btn">R$ 0,00</span>
            </button>
        </div>

        <!-- Item Modal -->
        <div id="item-modal-overlay" class="modal-overlay fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onclick="closeItemModal()"></div>
        <div id="item-modal" class="bottom-sheet fixed bottom-0 inset-x-0 rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[90%]" style="background-color: var(--bg); color: var(--text)">
            <div class="w-full flex justify-center pt-3 pb-2" onclick="closeItemModal()">
                <div class="w-12 h-1.5 rounded-full" style="background-color: color-mix(in srgb, var(--text) 20%, transparent)"></div>
            </div>
            <div class="overflow-y-auto flex-1 pb-24" id="item-modal-content"></div>
            <div class="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md border-t" style="background-color: color-mix(in srgb, var(--bg) 90%, transparent); border-color: color-mix(in srgb, var(--text) 10%, transparent)">
                <div class="flex gap-3">
                    <div class="flex items-center justify-between rounded-2xl px-3 w-28" style="background-color: color-mix(in srgb, var(--text) 5%, transparent)">
                        <button class="p-2 opacity-50 hover:opacity-100 disabled:opacity-20" onclick="updateQuantity(-1)" id="qty-minus">
                            <i data-lucide="minus" class="w-4 h-4"></i>
                        </button>
                        <span class="font-medium" id="item-qty">1</span>
                        <button class="p-2 opacity-50 hover:opacity-100" onclick="updateQuantity(1)">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <button onclick="addToCart()" class="flex-1 rounded-2xl py-3.5 font-semibold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform" style="background-color: var(--primary)">
                        <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                        Adicionar • <span id="item-total-price">R$ 0,00</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Cart Modal -->
        <div id="cart-modal-overlay" class="modal-overlay fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onclick="closeCartModal()"></div>
        <div id="cart-modal" class="bottom-sheet fixed bottom-0 inset-x-0 rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[90%] h-[80%]" style="background-color: var(--bg); color: var(--text)">
            <div class="w-full flex justify-center pt-3 pb-2" onclick="closeCartModal()">
                <div class="w-12 h-1.5 rounded-full" style="background-color: color-mix(in srgb, var(--text) 20%, transparent)"></div>
            </div>
            <div class="p-5 border-b" style="border-color: color-mix(in srgb, var(--text) 10%, transparent)">
                <h2 class="text-2xl font-bold">Seu Pedido</h2>
            </div>
            <div class="overflow-y-auto flex-1 p-5 space-y-4 pb-32" id="cart-items-container"></div>
            <div class="absolute bottom-0 inset-x-0 p-4 backdrop-blur-md border-t" style="background-color: color-mix(in srgb, var(--bg) 90%, transparent); border-color: color-mix(in srgb, var(--text) 10%, transparent)">
                <div class="flex justify-between items-center mb-4 px-2">
                    <span class="font-semibold">Total</span>
                    <span class="text-xl font-bold" style="color: var(--primary)" id="cart-final-total">R$ 0,00</span>
                </div>
                <button onclick="checkout()" id="checkout-btn" class="w-full rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50" style="background-color: var(--primary)">
                    <i data-lucide="send" class="w-5 h-5"></i>
                    Fazer Pedido
                </button>
                ${!menu.whatsappNumber ? '<p class="text-center text-xs text-red-400 mt-2">O número de WhatsApp não foi configurado pelo estabelecimento.</p>' : ''}
            </div>
        </div>
    </div>

    <script>
        const menuData = ${JSON.stringify(menu)};
        let cart = [];
        let currentItem = null;
        let currentQuantity = 1;
        let currentAddons = new Set();

        function formatPrice(price) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
        }

        const observerOptions = { root: null, rootMargin: '-20% 0px -80% 0px', threshold: 0 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id.replace('cat-', '');
                    updateActiveNav(id);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.category-section').forEach(section => observer.observe(section));

        function updateActiveNav(id) {
            document.querySelectorAll('.cat-nav-btn').forEach(btn => {
                if (btn.id === 'nav-' + id) {
                    btn.style.backgroundColor = 'var(--primary)';
                    btn.style.color = '#fff';
                    btn.style.border = 'none';
                    btn.classList.add('shadow-md');
                    btn.classList.remove('opacity-70');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    btn.style.backgroundColor = 'transparent';
                    btn.style.color = 'var(--text)';
                    btn.style.border = '1px solid currentColor';
                    btn.classList.remove('shadow-md');
                    btn.classList.add('opacity-70');
                }
            });
        }

        function scrollToCategory(id) {
            const el = document.getElementById('cat-' + id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function openItemModal(itemId) {
            for (const cat of menuData.categories) {
                const found = cat.items.find(i => i.id === itemId);
                if (found) { currentItem = found; break; }
            }
            if (!currentItem) return;

            currentQuantity = 1;
            currentAddons.clear();
            
            renderItemModalContent();
            updateItemTotal();

            document.getElementById('item-modal-overlay').classList.add('active');
            document.getElementById('item-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeItemModal() {
            document.getElementById('item-modal-overlay').classList.remove('active');
            document.getElementById('item-modal').classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { currentItem = null; }, 300);
        }

        function renderItemModalContent() {
            const container = document.getElementById('item-modal-content');
            let html = '';
            
            if (currentItem.imageUrl) {
                html += \`
                    <div class="w-full h-56 relative" style="background-color: color-mix(in srgb, var(--text) 5%, transparent)">
                        <img src="\${currentItem.imageUrl}" alt="\${currentItem.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                    </div>
                \`;
            }

            html += \`
                <div class="p-5">
                    <div class="flex justify-between items-start gap-4 mb-2">
                        <h2 class="text-2xl font-bold leading-tight">\${currentItem.name}</h2>
                        <span class="text-xl font-bold whitespace-nowrap" style="color: var(--primary)">
                            \${formatPrice(currentItem.price)}
                        </span>
                    </div>
                    <p class="text-sm opacity-80 leading-relaxed mb-6">\${currentItem.description}</p>
            \`;

            if (currentItem.addons && currentItem.addons.length > 0) {
                html += \`
                    <div>
                        <h3 class="font-semibold mb-3 flex items-center justify-between px-3 py-2 rounded-lg" style="background-color: color-mix(in srgb, var(--text) 5%, transparent)">
                            Adicionais
                            <span class="text-xs font-normal opacity-60">Opcional</span>
                        </h3>
                        <div class="space-y-3 px-1">
                            \${currentItem.addons.map(addon => \`
                                <label class="flex items-center justify-between cursor-pointer group" onclick="toggleAddon('\${addon.id}', this)">
                                    <div class="flex items-center gap-3">
                                        <div class="addon-checkbox w-5 h-5 rounded border-2 flex items-center justify-center transition-colors" style="border-color: color-mix(in srgb, var(--text) 20%, transparent); background-color: transparent" data-id="\${addon.id}">
                                        </div>
                                        <span class="text-sm font-medium">\${addon.name}</span>
                                    </div>
                                    <span class="text-sm opacity-70">+ \${formatPrice(addon.price)}</span>
                                </label>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            html += \`</div>\`;
            container.innerHTML = html;
            lucide.createIcons();
        }

        function toggleAddon(addonId, labelEl) {
            if (currentAddons.has(addonId)) {
                currentAddons.delete(addonId);
            } else {
                currentAddons.add(addonId);
            }
            
            const checkbox = labelEl.querySelector('.addon-checkbox');
            if (currentAddons.has(addonId)) {
                checkbox.style.borderColor = 'var(--primary)';
                checkbox.style.backgroundColor = 'var(--primary)';
                checkbox.innerHTML = '<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-white"></i>';
            } else {
                checkbox.style.borderColor = 'color-mix(in srgb, var(--text) 20%, transparent)';
                checkbox.style.backgroundColor = 'transparent';
                checkbox.innerHTML = '';
            }
            lucide.createIcons();
            updateItemTotal();
        }

        function updateQuantity(delta) {
            currentQuantity += delta;
            if (currentQuantity < 1) currentQuantity = 1;
            document.getElementById('item-qty').innerText = currentQuantity;
            document.getElementById('qty-minus').disabled = currentQuantity <= 1;
            updateItemTotal();
        }

        function updateItemTotal() {
            if (!currentItem) return;
            let total = currentItem.price;
            if (currentItem.addons) {
                currentItem.addons.forEach(addon => {
                    if (currentAddons.has(addon.id)) {
                        total += addon.price;
                    }
                });
            }
            total *= currentQuantity;
            document.getElementById('item-total-price').innerText = formatPrice(total);
        }

        function addToCart() {
            if (!currentItem) return;
            
            const addonsToAdd = currentItem.addons ? currentItem.addons.filter(a => currentAddons.has(a.id)) : [];
            let total = currentItem.price;
            addonsToAdd.forEach(a => total += a.price);
            total *= currentQuantity;

            cart.push({
                id: crypto.randomUUID(),
                item: currentItem,
                quantity: currentQuantity,
                addons: addonsToAdd,
                total: total
            });

            closeItemModal();
            updateCartUI();
        }

        function removeFromCart(cartItemId) {
            cart = cart.filter(item => item.id !== cartItemId);
            updateCartUI();
            if (cart.length === 0) {
                closeCartModal();
            }
        }

        function updateCartUI() {
            const floatingCart = document.getElementById('floating-cart');
            const badge = document.getElementById('cart-badge');
            const totalBtn = document.getElementById('cart-total-btn');
            
            if (cart.length > 0) {
                floatingCart.classList.add('active');
                const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
                const totalPrice = cart.reduce((acc, item) => acc + item.total, 0);
                
                badge.innerText = totalItems;
                totalBtn.innerText = formatPrice(totalPrice);
                
                document.getElementById('cart-final-total').innerText = formatPrice(totalPrice);
                document.getElementById('checkout-btn').disabled = !menuData.whatsappNumber;
            } else {
                floatingCart.classList.remove('active');
            }
            
            renderCartItems();
        }

        function openCartModal() {
            renderCartItems();
            document.getElementById('cart-modal-overlay').classList.add('active');
            document.getElementById('cart-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
            document.getElementById('floating-cart').classList.remove('active');
        }

        function closeCartModal() {
            document.getElementById('cart-modal-overlay').classList.remove('active');
            document.getElementById('cart-modal').classList.remove('active');
            document.body.style.overflow = '';
            if (cart.length > 0) {
                document.getElementById('floating-cart').classList.add('active');
            }
        }

        function renderCartItems() {
            const container = document.getElementById('cart-items-container');
            if (cart.length === 0) {
                container.innerHTML = '<div class="text-center py-10 opacity-50">Seu carrinho está vazio.</div>';
                return;
            }
            
            container.innerHTML = cart.map(cartItem => \`
                <div class="flex gap-3 pb-4 border-b last:border-0" style="border-color: color-mix(in srgb, var(--text) 10%, transparent)">
                    <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-medium text-sm shrink-0" style="background-color: color-mix(in srgb, var(--text) 5%, transparent)">
                        \${cartItem.quantity}x
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-semibold leading-tight">\${cartItem.item.name}</h4>
                            <button onclick="removeFromCart('\${cartItem.id}')" class="p-1 opacity-50 hover:opacity-100 text-red-400">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                        \${cartItem.addons.length > 0 ? \`
                            <p class="text-xs opacity-60 mt-1 line-clamp-2">
                                Com: \${cartItem.addons.map(a => a.name).join(', ')}
                            </p>
                        \` : ''}
                        <div class="mt-2 font-medium" style="color: var(--primary)">
                            \${formatPrice(cartItem.total)}
                        </div>
                    </div>
                </div>
            \`).join('');
            lucide.createIcons();
        }

        function checkout() {
            if (cart.length === 0 || !menuData.whatsappNumber) return;

            let message = 'Olá! Gostaria de fazer o seguinte pedido:\\n\\n';
            let cartTotal = 0;
            
            cart.forEach(cartItem => {
                message += \`\${cartItem.quantity}x \${cartItem.item.name} - \${formatPrice(cartItem.total)}\\n\`;
                if (cartItem.addons.length > 0) {
                    message += \`   Adicionais: \${cartItem.addons.map(a => a.name).join(', ')}\\n\`;
                }
                cartTotal += cartItem.total;
            });

            message += \`\\n*Total: \${formatPrice(cartTotal)}*\`;

            const encodedMessage = encodeURIComponent(message);
            const phone = menuData.whatsappNumber.replace(/\\D/g, '');
            const whatsappUrl = \`https://wa.me/\${phone}?text=\${encodedMessage}\`;
            
            window.open(whatsappUrl, '_blank');
        }

        lucide.createIcons();
    </script>
</body>
</html>`;
};

export const publishToGithub = async (token: string, repoName: string, menu: MenuData) => {
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    // 1. Get user
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error('Token inválido ou expirado.');
    const userData = await userRes.json();
    const username = userData.login;

    // 2. Create repo (ignore if exists)
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: repoName,
            description: 'Cardápio virtual gerado pelo CCV',
            homepage: `https://${username}.github.io/${repoName}`,
            private: false,
            auto_init: true
        })
    });

    if (!createRepoRes.ok && createRepoRes.status !== 422) {
        throw new Error('Erro ao criar repositório.');
    }

    // Wait a bit for repo initialization
    await new Promise(r => setTimeout(r, 2000));

    // Get default branch
    let branch = 'main';
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers, cache: 'no-store' });
    if (repoRes.ok) {
        const repoData = await repoRes.json();
        branch = repoData.default_branch || 'main';
    }

    // 3. Create/Update index.html
    const htmlContent = generateStandaloneHTML(menu);
    const utf8Bytes = new TextEncoder().encode(htmlContent);
    
    const encodedContent = await new Promise<string>((resolve) => {
        const blob = new Blob([utf8Bytes]);
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(',')[1]);
        };
        reader.readAsDataURL(blob);
    });

    // Check if file exists to get SHA
    const fileRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/index.html`, { headers, cache: 'no-store' });
    let sha = undefined;
    if (fileRes.ok) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
    }

    const putFileRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/index.html`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            message: 'Atualizando cardápio via CCV',
            content: encodedContent,
            sha: sha,
            branch: branch
        })
    });

    if (!putFileRes.ok) {
        const errorData = await putFileRes.json().catch(() => ({ message: putFileRes.statusText }));
        throw new Error(`Erro ao fazer upload do arquivo HTML: ${errorData.message}`);
    }

    // 4. Enable GitHub Pages
    const pagesRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            source: { branch: branch, path: '/' }
        })
    });
    
    if (!pagesRes.ok && pagesRes.status !== 409) {
        const errorData = await pagesRes.json().catch(() => ({ message: pagesRes.statusText }));
        console.error('Erro ao ativar GitHub Pages:', errorData.message);
    }

    return `https://${username}.github.io/${repoName}`;
};
