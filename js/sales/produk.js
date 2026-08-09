document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('productContainer');
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('categoryFilter');

    let products = [];

    // 1. Ambil Katalog Produk dari API
    async function loadProducts() {
        try {
            const response = await apiRequest('/products');
            products = response.data || [];
            renderProducts(products);
        } catch (err) {
            productContainer.innerHTML = `
                <div class="section-block" style="padding: 1.5rem; text-align: center; color: #991b1b; background: #fee2e2; border: 1px solid #fecaca;">
                    <p style="font-size: 0.9rem; margin: 0;">Gagal memuat daftar produk.</p>
                </div>
            `;
        }
    }

    // 2. Render Kartu Produk ke Halaman
    function renderProducts(data) {
        if (data.length === 0) {
            productContainer.innerHTML = `
                <div class="section-block" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                    <p style="font-size: 0.9rem; margin: 0;">Tidak ada produk yang ditemukan.</p>
                </div>
            `;
            return;
        }

        let html = '';
        data.forEach(p => {
            const stockBadge = p.stock > 0 
                ? `<span style="background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Stok: ${p.stock}</span>`
                : `<span style="background: #fee2e2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Habis</span>`;

            const prodId = p.id || p.product_id;

            html += `
                <div class="section-block product-card" data-id="${prodId}" style="padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #2563eb; cursor: pointer; margin-bottom: 0.75rem;">
                    <div>
                        <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e3a8a; margin: 0 0 0.25rem 0;">${p.name}</h4>
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">Kategori: ${p.category_name || p.category}</div>
                        <div style="font-size: 0.9rem; font-weight: 700; color: #0f172a;">Rp ${Number(p.price).toLocaleString('id-ID')}</div>
                    </div>
                    <div style="text-align: right;">
                        ${stockBadge}
                    </div>
                </div>
                <div id="sub-container-${prodId}"></div>
            `;
        });
        productContainer.innerHTML = html;
    }

    // 3. Filter dan Pencarian Real-time
    function filterAndSearch() {
        const keyword = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = products.filter(p => {
            const matchName = p.name.toLowerCase().includes(keyword);
            const matchCategory = category === '' || p.category === category;
            return matchName && matchCategory;
        });

        renderProducts(filtered);
    }

    // 4. Event Listener untuk Klik Kartu Produk (Substitusi)
    productContainer.addEventListener('click', async (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const productId = card.getAttribute('data-id');
        const subContainer = document.getElementById(`sub-container-${productId}`);
        if (!subContainer) return;

        if (subContainer.innerHTML.trim() !== '') {
            subContainer.innerHTML = '';
            return;
        }

        try {
            subContainer.innerHTML = '<div style="padding: 0.75rem 1rem; font-size: 0.8rem; color: #64748b; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 0.75rem;">Memuat produk substitusi...</div>';
            
            const response = await apiRequest(`/products/${productId}/substitutes`);
            const substitutes = response.data || [];

            if (substitutes.length === 0) {
                subContainer.innerHTML = '<div style="padding: 0.75rem 1rem; font-size: 0.8rem; color: #991b1b; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 0.75rem;">Tidak ada produk substitusi tersedia.</div>';
                return;
            }

            let subHtml = '<div style="padding: 0.75rem 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 0.75rem;">';
            subHtml += '<p style="font-weight: 600; font-size: 0.85rem; margin: 0 0 0.5rem 0; color: #1e3a8a;">Produk Substitusi:</p>';
            substitutes.forEach(sub => {
                subHtml += `
                    <div style="padding: 0.4rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                        <span>${sub.name}</span>
                        <span style="font-weight: 600; color: #0f172a;">Rp ${Number(sub.price).toLocaleString('id-ID')}</span>
                    </div>
                `;
            });
            subHtml += '</div>';
            subContainer.innerHTML = subHtml;

        } catch (err) {
            subContainer.innerHTML = '<div style="padding: 0.75rem 1rem; font-size: 0.8rem; color: #991b1b; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 0.75rem;">Gagal memuat produk substitusi.</div>';
        }
    });

    searchInput.addEventListener('input', filterAndSearch);
    categoryFilter.addEventListener('change', filterAndSearch);

    loadProducts();
});