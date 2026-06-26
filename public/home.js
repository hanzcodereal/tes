const Home = {
    render() {
        gid('view-home').innerHTML = `
        <div class="sticky top-0 z-10" style="position:sticky;top:0;z-index:10;">
            <div class="bg-gradient-to-b from-[#1ed760]/20 via-[#1a1a1a] to-[#121212] pt-12 px-4 pb-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-black text-[#1ed760]">HanzzMusify</h1>
                        <p class="text-[#b3b3b3] text-xs mt-1">Rekomendasi buat kamu</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="openServerSettings()" class="text-[#b3b3b3] hover:text-white active:scale-90 p-2">
                            <i data-lucide="settings" class="w-5 h-5"></i>
                        </button>
                        <button onclick="Home.refresh()" class="text-[#b3b3b3] hover:text-white active:scale-90">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="px-4 space-y-6 mt-2 pb-4">
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
                <h2 class="text-lg font-bold mb-3">Viral TikTok</h2>
                <div id="home-tiktok" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Galau Terpopuler</h2>
                <div id="home-galau" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Hit Terpopuler Hari Ini</h2>
                <div id="home-hits" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
            <div>
                <h2 class="text-lg font-bold mb-3">Playlist</h2>
                <div id="home-scroll" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    async fetch() {
        try {
            const currentYear = new Date().getFullYear();
            const queries = [
                'lagu baru rilis indonesia ' + currentYear,
                'lagu populer indonesia',
                'lagu viral tiktok indonesia',
                'lagu galau indonesia',
                'lagu hits indonesia ' + currentYear
            ];
            
            const allSongs = [];
            const categoryData = {};
            
            for (let i = 0; i < queries.length; i++) {
                const q = queries[i];
                const r = await fetch(API.search + '?query=' + encodeURIComponent(q));
                const d = await r.json();
                
                if (d.status && d.result.songs) {
                    const songs = d.result.songs.slice(0, 6).map(function(s) {
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
                    
                    const categoryNames = ['home-grid', 'home-new', 'home-popular', 'home-tiktok', 'home-galau', 'home-hits'];
                    const categoryIndex = ['home0', 'home1', 'home2', 'home3', 'home4', 'home5'];
                    
                    if (i === 0) {
                        categoryData['home-grid'] = songs;
                        categoryData['home-new'] = songs.slice(0, 6);
                    } else if (i === 1) {
                        categoryData['home-popular'] = songs;
                    } else if (i === 2) {
                        categoryData['home-tiktok'] = songs;
                    } else if (i === 3) {
                        categoryData['home-galau'] = songs;
                    } else if (i === 4) {
                        categoryData['home-hits'] = songs;
                    }
                    
                    allSongs.push(...songs);
                }
            }
            
            if (allSongs.length > 0) {
                const categoryMap = {
                    'home-grid': 'home0',
                    'home-new': 'home1',
                    'home-popular': 'home2',
                    'home-tiktok': 'home3',
                    'home-galau': 'home4',
                    'home-hits': 'home5'
                };
                
                for (const [id, songs] of Object.entries(categoryData)) {
                    const container = gid(id);
                    if (container && songs && songs.length > 0) {
                        const prefix = categoryMap[id] || 'home0';
                        if (id === 'home-grid') {
                            container.innerHTML = songs.map(function(t, i) {
                                return '<div onclick="PK(\'' + prefix + '\',' + i + ')" class="bg-[#181818] hover:bg-[#282828] rounded-xl flex items-center gap-3 p-2 cursor-pointer active:scale-95 transition-colors" style="animation-delay:' + (i * 50) + 'ms"><img src="' + getHDImage(t.cover) + '" class="w-14 h-14 rounded-lg object-cover shadow-lg" onerror="this.src=\'' + FI + '\'" /><span class="font-bold text-sm line-clamp-2">' + es(t.title) + '</span></div>';
                            }).join('');
                        } else {
                            container.innerHTML = songs.map(function(t, i) {
                                return '<div onclick="PK(\'' + prefix + '\',' + i + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95" style="animation-delay:' + ((i) * 50) + 'ms"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-xl shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate">' + es(t.title) + '</h3><p class="text-[#6b7280] text-xs truncate mt-1">' + es(t.artist) + '</p></div>';
                            }).join('');
                        }
                    }
                }
                
                const playlistContainer = gid('home-scroll');
                if (playlistContainer) {
                    const playlistSongs = allSongs.slice(6, 12);
                    if (playlistSongs.length > 0) {
                        playlistContainer.innerHTML = playlistSongs.map(function(t, i) {
                            return '<div onclick="PK(\'home1\',' + (i + 6) + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95" style="animation-delay:' + ((i + 6) * 50) + 'ms"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-xl shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate">' + es(t.title) + '</h3><p class="text-[#6b7280] text-xs truncate mt-1">' + es(t.artist) + '</p></div>';
                        }).join('');
                    }
                }
                
                S.ht = allSongs;
                lucide.createIcons();
            }
        } catch (e) {}
    },
    show() {
        const g = gid('home-grid');
        const s = gid('home-scroll');
        if (!g || !s) return;
        
        g.innerHTML = S.ht.slice(0, 6).map(function(t, i) {
            return '<div onclick="PK(\'home0\',' + i + ')" class="bg-[#181818] hover:bg-[#282828] rounded-xl flex items-center gap-3 p-2 cursor-pointer active:scale-95 transition-colors" style="animation-delay:' + (i * 50) + 'ms"><img src="' + getHDImage(t.cover) + '" class="w-14 h-14 rounded-lg object-cover shadow-lg" onerror="this.src=\'' + FI + '\'" /><span class="font-bold text-sm line-clamp-2">' + es(t.title) + '</span></div>';
        }).join('');
        
        s.innerHTML = S.ht.slice(6, 12).map(function(t, i) {
            return '<div onclick="PK(\'home1\',' + i + ')" class="flex-shrink-0 w-40 cursor-pointer active:scale-95" style="animation-delay:' + ((i + 6) * 50) + 'ms"><div class="w-40 h-40 mb-2 relative"><img src="' + getHDImage(t.cover) + '" class="w-full h-full object-cover rounded-xl shadow-lg" onerror="this.src=\'' + FI + '\'" /><div class="absolute bottom-2 right-2 bg-[#1ed760] text-black rounded-full p-3 opacity-0 hover:opacity-100 transition-all"><i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm truncate">' + es(t.title) + '</h3><p class="text-[#6b7280] text-xs truncate mt-1">' + es(t.artist) + '</p></div>';
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
