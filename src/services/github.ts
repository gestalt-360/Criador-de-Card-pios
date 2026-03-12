import { MenuData } from '../types';

export const generateStandaloneHTML = (menu: MenuData): string => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        }
        .text-primary { color: var(--primary); }
        .bg-primary { background-color: var(--primary); }
        .border-primary { border-color: var(--primary); }
    </style>
</head>
<body>
    <div id="app" class="max-w-md mx-auto min-h-screen relative pb-24 bg-black/10 shadow-2xl">
        <!-- Header -->
        <header class="relative h-48 bg-gray-900 flex items-end justify-center pb-6">
            ${menu.logoUrl ? `<img src="${menu.logoUrl}" class="absolute inset-0 w-full h-full object-cover opacity-40" />` : ''}
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div class="relative z-10 text-center px-4">
                <h1 class="text-3xl font-bold text-white mb-2">${menu.name}</h1>
                <p class="text-gray-300 text-sm">${menu.description}</p>
            </div>
        </header>

        <!-- Categories -->
        <main class="p-4 space-y-8">
            ${menu.categories.map(cat => `
                <section>
                    <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">${cat.name}</h2>
                    <div class="space-y-4">
                        ${cat.items.map(item => `
                            <div class="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                ${item.imageUrl ? `<img src="${item.imageUrl}" class="w-20 h-20 rounded-lg object-cover" />` : ''}
                                <div class="flex-1">
                                    <h3 class="font-semibold">${item.name}</h3>
                                    <p class="text-sm opacity-70 line-clamp-2 mb-2">${item.description}</p>
                                    <div class="flex justify-between items-center">
                                        <span class="font-bold text-primary">R$ ${item.price.toFixed(2)}</span>
                                        <button onclick="addToCart('${item.id}', event)" class="bg-primary text-white p-1.5 rounded-lg active:scale-95 transition-transform">
                                            <i data-lucide="plus" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `).join('')}
        </main>

        <!-- Cart Button -->
        <div id="cart-button" class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md hidden z-50">
            <button onclick="checkout()" class="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg flex justify-between px-6 items-center active:scale-95 transition-transform">
                <span id="cart-count" class="bg-black/20 px-3 py-1 rounded-lg">0</span>
                <span class="flex items-center gap-2"><i data-lucide="send" class="w-5 h-5"></i> Fazer Pedido</span>
                <span id="cart-total">R$ 0.00</span>
            </button>
        </div>
    </div>

    <script>
        const menuData = ${JSON.stringify(menu)};
        let cart = [];

        function addToCart(itemId, event) {
            let item = null;
            for (const cat of menuData.categories) {
                const found = cat.items.find(i => i.id === itemId);
                if (found) item = found;
            }
            if (!item) return;

            cart.push({ item: item, quantity: 1 });
            updateCart();
            
            // Simple feedback
            if (event && event.currentTarget) {
                const btn = event.currentTarget;
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    lucide.createIcons();
                }, 1000);
            }
        }

        function updateCart() {
            const btn = document.getElementById('cart-button');
            const count = document.getElementById('cart-count');
            const total = document.getElementById('cart-total');

            if (cart.length > 0) {
                btn.classList.remove('hidden');
                count.innerText = cart.length;
                const sum = cart.reduce((acc, curr) => acc + curr.item.price, 0);
                total.innerText = 'R$ ' + sum.toFixed(2);
            } else {
                btn.classList.add('hidden');
            }
        }

        function checkout() {
            if (cart.length === 0) return;
            
            let text = 'Olá! Gostaria de fazer o seguinte pedido:\\n\\n';
            let total = 0;
            
            cart.forEach((cartItem) => {
                text += \`\${cartItem.quantity}x \${cartItem.item.name} - R$ \${cartItem.item.price.toFixed(2)}\\n\`;
                total += cartItem.item.price;
            });
            
            text += \`\\n*Total: R$ \${total.toFixed(2)}*\`;
            
            const phone = menuData.whatsappNumber.replace(/\\D/g, '');
            const url = \`https://wa.me/\${phone}?text=\${encodeURIComponent(text)}\`;
            window.open(url, '_blank');
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
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
    if (repoRes.ok) {
        const repoData = await repoRes.json();
        branch = repoData.default_branch || 'main';
    }

    // 3. Create/Update index.html
    const htmlContent = generateStandaloneHTML(menu);
    const utf8Bytes = new TextEncoder().encode(htmlContent);
    let binary = '';
    for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
    }
    const encodedContent = btoa(binary);

    // Check if file exists to get SHA
    const fileRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/index.html`, { headers });
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
        throw new Error('Erro ao fazer upload do arquivo HTML.');
    }

    // 4. Enable GitHub Pages
    await fetch(`https://api.github.com/repos/${username}/${repoName}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            source: { branch: branch, path: '/' }
        })
    });

    return `https://${username}.github.io/${repoName}`;
};
