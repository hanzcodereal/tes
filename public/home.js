const Home = {
    render() {
        gid('view-home').innerHTML = `
        <div class="bg-gradient-to-b from-[#1ed760]/20 via-[#1a1a1a] to-[#121212] pt-12 pb-6 px-4 sticky top-0 z-10">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-black text-[#1ed760]">HanzzMusify</h1>
                    <p class="text-[#b3b3b3] text-xs mt-1">Rekomendasi buat kamu</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="openServerSettings()" class="text-[#b3b3b3] hover:text-white active:scale-90 p-2" title="Pengaturan Server">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                    </button>
                    <button onclick="Home.refresh()" class="text-[#b3b3b3] hover:text-white active:scale-90">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="px-4 space-y-6 mt-4">
            <div id="home-grid" class="grid grid-cols-2 gap-3"></div>
            <div>
                <h2 class="text-lg font-bold mb-3">Baru Rilis</h2>
                <div id="home-new" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Lagu Populer</h2>
                <div id="home-popular" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Album & Single Populer</h2>
                <div id="home-albums" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Viral TikTok</h2>
                <div id="home-tiktok" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Galau Terpopuler</h2>
                <div id="home-galau" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Artis Terpopuler Saat Ini</h2>
                <div id="home-artists" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    async fetch() {
        try {
            const queries = [
                'lagu viral indonesia 2026',
                'top hits indonesia',
                'lagu terbaru'
            ];
            const q = queries[Math.floor(Math.random() * queries.length)];
            const r = await fetch(API.search + '?query=' + encodeURIComponent(q));
            const d = await r.json();
            
            if (d.status && d.result.songs) {
                const allSongs = d.result.songs.map(function(s) {
                    return {
                        id: s.videoId,
                        videoId: s.videoId,
                        title: cn(s.title),
                        artist: cn(s.artist),
                        artistId: s.artistId || '',
                        cover: getHDImage(s.thumbnail) || FI,
                        ytUrl: s.url
                    };
                });
                
                const chunkSize = Math.ceil(allSongs.length / 6);
                const categories = [
                    { id: 'home-grid', label: 'Rekomendasi', count: 6 },
                    { id: 'home-new', label: 'Baru Rilis', count: 6 },
                    { id: 'home-popular', label: 'Lagu Populer', count: 6 },
                    { id: 'home-albums', label: 'Album & Single', count: 6 },
                    { id: 'home-tiktok', label: 'Viral TikTok', count: 6 },
                    { id: 'home-galau', label: 'Galau', count: 6 }
                ];
                
                categories.forEach((cat, idx) => {
                    const start = idx * 6;
                    const end = start + 6;
                    const songs = allSongs.slice(start, end);
                    if (songs.length > 0) {
                        const container = gid(cat.id);
                        if (container) {
                            if (cat.id === 'home-grid') {
                                container.innerHTML = songs.map(function(t, i) {
                                    return '<div onclick="PK(\'home1\',' + i + ')" class="bg-[#181818] hover:bg-[#282828] rounded-xl flex items-center gap-3 p-2 cursor-pointer active:scale-95 transition-colors" style="animation-delay:' + (i * 50) + 'ms"><img src="' + getHDImage(t.cover) + '" class="w-14 h-14 rounded-lg object-cover shadow-lg" onerror="this.src=\'' + FI + '\'" /><span class="font-bold text-sm line-clamp-2">' + es(t.title) + '</span></div>';
                                }).join('');
                            } else {
                                container.innerHTML = songs.map(function(t, i) {
                                    return '<div onclick="PK(\'home' + idx + '\',' + i + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95" style="animation-delay:' + ((i) * 50) + 'ms"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-xl shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate">' + es(t.title) + '</h3><p class="text-[#6b7280] text-xs truncate mt-1">' + es(t.artist) + '</p></div>';
                                }).join('');
                            }
                        }
                    }
                });
                
                const artistContainer = gid('home-artists');
                if (artistContainer && allSongs.length >= 6) {
                    const artistSongs = allSongs.slice(0, 6);
                    artistContainer.innerHTML = artistSongs.map(function(t, i) {
                        return '<div onclick="PK(\'home5\',' + i + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-full shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate text-center">' + es(t.artist) + '</h3></div>';
                    }).join('');
                }
                
                S.ht = allSongs;
                lucide.createIcons();
            }
        } catch (e) {
            console.error('Home fetch error:', e);
        }
    },
    show() {
        const g = gid('home-grid');
        const s = gid('home-scroll');
        if (!g || !s) return;
        
        g.innerHTML = S.ht.slice(0, 6).map(function(t, i) {
            return '<div onclick="PK(\'home1\',' + i + ')" class="bg-[#181818] hover:bg-[#282828] rounded-xl flex items-center gap-3 p-2 cursor-pointer active:scale-95 transition-colors" style="animation-delay:' + (i * 50) + 'ms"><img src="' + getHDImage(t.cover) + '" class="w-14 h-14 rounded-lg object-cover shadow-lg" onerror="this.src=\'' + FI + '\'" /><span class="font-bold text-sm line-clamp-2">' + es(t.title) + '</span></div>';
        }).join('');
        
        s.innerHTML = S.ht.slice(6, 12).map(function(t, i) {
            return '<div onclick="PK(\'home2\',' + i + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95" style="animation-delay:' + ((i + 6) * 50) + 'ms"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-xl shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate">' + es(t.title) + '</h3><p class="text-[#6b7280] text-xs truncate mt-1">' + es(t.artist) + '</p></div>';
        }).join('');
        
        lucide.createIcons();
    },
    refresh() {
        Home.fetch();
        gid('main-area').scrollTop = 0;
    }
};

Home.render();
Home.fetch();