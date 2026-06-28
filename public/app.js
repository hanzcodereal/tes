const App={
    init(){
        gid('nav-container').innerHTML=`
        <div class="nav-blur pb-safe h-[65px] flex items-center justify-around fixed bottom-0 w-full z-40">
            <button onclick="App.switch('home')" id="nav-home" class="flex flex-col items-center text-[#1ed760] active:scale-90"><i data-lucide="home" class="w-5 h-5 fill-current"></i><span class="text-[10px]">Home</span></button>
            <button onclick="App.switch('search')" id="nav-search" class="flex flex-col items-center text-[#6b7280] active:scale-90"><i data-lucide="search" class="w-5 h-5"></i><span class="text-[10px]">Search</span></button>
            <button onclick="App.switch('library')" id="nav-library" class="flex flex-col items-center text-[#6b7280] active:scale-90"><i data-lucide="library" class="w-5 h-5"></i><span class="text-[10px]">Library</span></button>
            <button onclick="App.switch('dev')" id="nav-dev" class="flex flex-col items-center text-[#6b7280] active:scale-90"><i data-lucide="info" class="w-5 h-5"></i><span class="text-[10px]">Info</span></button>
        </div>`;
        
        gid('view-dev').innerHTML=`
        <div class="pt-12 px-4 text-center">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-[#1ed760] to-green-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#1ed760]/30"><i data-lucide="music" class="w-12 h-12 text-white"></i></div>
            <h1 class="text-3xl font-black text-[#1ed760] mb-1">HanzzMusify</h1>
            <p class="text-[#b3b3b3] text-sm mb-6">Streaming Musik YouTube dengan Lirik</p>
            
            <div class="bg-[#181818] rounded-2xl p-5 max-w-sm mx-auto border border-white/10 space-y-3 text-left mb-4">
                <h3 class="text-[#1ed760] font-bold text-sm uppercase tracking-wider mb-2">Aplikasi</h3>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Nama</span><span class="text-white font-medium text-sm">HanzzMusify</span></div>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Versi</span><span class="text-white font-medium text-sm">v3.0.0</span></div>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Framework</span><span class="text-white font-medium text-sm">HTML + Tailwind + JS</span></div>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Hosting</span><span class="text-white font-medium text-sm">Vercel</span></div>
            </div>
            
            <div class="bg-[#181818] rounded-2xl p-5 max-w-sm mx-auto border border-white/10 space-y-3 text-left mb-6">
                <h3 class="text-[#1ed760] font-bold text-sm uppercase tracking-wider mb-2">Developer</h3>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Nama</span><span class="text-white font-bold text-sm">Hanzz</span></div>
                <div class="flex justify-between"><span class="text-[#6b7280] text-sm">Email</span><span class="text-white font-bold text-sm">hanzzcodee@gmail.com</span></div>
            </div>
        </div>`;
        
        MP.init();
        FullPlayer.init();
        Artist.init();
        Home.render();
        Search.render();
        lucide.createIcons();
        setTimeout(function(){ App.checkUrl(); }, 500);
        App.showV3Popup();
    },
    checkUrl(){
        var p=new URLSearchParams(location.search);
        var play=p.get('play'),search=p.get('search'),isShared=p.get('share')==='1';
        if(play){
            if(isShared){
                App.showSharePopup(play);
            } else {
                App.autoPlayTrack(play);
            }
        } else if(search){
            setTimeout(function(){
                var si=gid('search-input');
                if(si){
                    si.value=decodeURIComponent(search);
                    gid('search-form').dispatchEvent(new Event('submit'));
                }
                App.switch('search');
            },300);
        }
    },
    autoPlayTrack(videoId){
        fetch(API.search+'?query=https://youtube.com/watch?v='+videoId)
        .then(function(r){return r.json();})
        .then(function(d){
            var title='Lagu',artist='HanzzMusify',cover=FI,artistId='';
            if(d.status && d.result.songs && d.result.songs.length>0){
                var song=d.result.songs[0];
                title=cn(song.title);
                artist=cn(song.artist);
                cover=getHDImage(song.thumbnail)||FI;
                artistId=song.artistId||'';
            }
            S.ct={id:videoId,videoId:videoId,title:title,artist:artist,cover:cover,artistId:artistId,ytUrl:'https://youtube.com/watch?v='+videoId};
            S.ps='direct';
            S.pl=[S.ct];
            S.pi=0;
            S.lyricsLoaded=false;
            S.ld={type:'none',lines:[]};
            S.cli=-1;
            S.lyricsFetching=false;
            UU();
            MP.show();
            setTimeout(function(){
                FullPlayer.open();
                S.il=true;
                UB();
                if(S.yp && S.yr) S.yp.loadVideoById({videoId:videoId});
                if(S.lo) fetchLyrics(videoId);
                resetLyricsUI(videoId);
            },400);
        })
        .catch(function(){
            S.ct={id:videoId,videoId:videoId,title:'Lagu',artist:'HanzzMusify',cover:FI,artistId:'',ytUrl:'https://youtube.com/watch?v='+videoId};
            S.ps='direct';
            S.pl=[S.ct];
            S.pi=0;
            S.lyricsLoaded=false;
            S.ld={type:'none',lines:[]};
            S.cli=-1;
            S.lyricsFetching=false;
            UU();
            MP.show();
            setTimeout(function(){
                FullPlayer.open();
                S.il=true;
                UB();
                if(S.yp && S.yr) S.yp.loadVideoById({videoId:videoId});
                if(S.lo) fetchLyrics(videoId);
                resetLyricsUI(videoId);
            },400);
        });
    },
    showSharePopup(videoId){
        fetch(API.search+'?query=https://youtube.com/watch?v='+videoId)
        .then(function(r){return r.json();})
        .then(function(d){
            var title='Lagu',artist='HanzzMusify',cover=FI;
            if(d.status && d.result.songs && d.result.songs.length>0){
                var song=d.result.songs[0];
                title=cn(song.title);
                artist=cn(song.artist);
                cover=getHDImage(song.thumbnail)||FI;
            }
            App.renderPopup(videoId,title,artist,cover);
        })
        .catch(function(){
            App.renderPopup(videoId,'Lagu','HanzzMusify',FI);
        });
    },
    renderPopup(videoId,title,artist,cover){
        var popup=document.createElement('div');
        popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.onclick=function(e){if(e.target===popup)popup.remove();};
        popup.innerHTML='<div class="bg-[#181818] w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.4s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><div class="flex items-center gap-4 mb-4"><img src="'+getHDImage(cover)+'" class="w-16 h-16 rounded-xl object-cover shadow-lg" onerror="this.src=\''+FI+'\'" /><div class="flex-1 truncate"><h3 class="font-bold text-white truncate">'+title+'</h3><p class="text-[#b3b3b3] text-sm truncate">'+artist+'</p></div></div><p class="text-[#6b7280] text-xs mb-4 text-center">Seseorang membagikan lagu ini kepadamu</p><div class="flex gap-3"><button id="popup-play" class="flex-1 bg-[#1ed760] text-black font-bold py-3 rounded-full active:scale-95">Putar Sekarang</button><button id="popup-later" class="px-6 py-3 border border-white/20 text-white rounded-full active:scale-95">Nanti</button></div></div>';
        document.body.appendChild(popup);
        popup.querySelector('#popup-play').onclick=function(){
            popup.remove();
            S.ct={id:videoId,videoId:videoId,title:title,artist:artist,cover:getHDImage(cover),artistId:'',ytUrl:'https://youtube.com/watch?v='+videoId};
            S.ps='direct';
            S.pl=[S.ct];
            S.pi=0;
            S.lyricsLoaded=false;
            S.ld={type:'none',lines:[]};
            S.cli=-1;
            S.lyricsFetching=false;
            UU();
            MP.show();
            setTimeout(function(){
                FullPlayer.open();
                S.il=true;
                UB();
                if(S.yp && S.yr) S.yp.loadVideoById({videoId:videoId});
                if(S.lo) fetchLyrics(videoId);
                resetLyricsUI(videoId);
            },400);
        };
        popup.querySelector('#popup-later').onclick=function(){popup.remove();};
    },
    switch(t){
        S.at=t;
        ['home','search','library','dev'].forEach(function(id){
            gid('view-'+id).style.display='none';
        });
        if(t==='library'){Library.render();}
        gid('view-'+t).style.display='block';
        ['home','search','library','dev'].forEach(function(n){
            var b=gid('nav-'+n);
            if(!b)return;
            b.classList.remove('text-[#1ed760]');
            b.classList.add('text-[#6b7280]');
            var i=b.querySelector('i');
            if(i)i.classList.remove('fill-current');
        });
        var ab=gid('nav-'+t);
        if(!ab)return;
        ab.classList.remove('text-[#6b7280]');
        ab.classList.add('text-[#1ed760]');
        if(t==='home') {
            var hi=ab.querySelector('i');
            if(hi) hi.classList.add('fill-current');
        }
        gid('main-area').scrollTop=0;
        lucide.createIcons();
    },
    showV3Popup() {
        if(localStorage.getItem('seen_v3_popup_update')) return;
        var popup = document.createElement('div');
        popup.id = 'v3-popup';
        popup.className = 'fixed inset-0 z-[400] flex items-center justify-center bg-black/80 px-4';
        popup.style.backdropFilter = 'blur(8px)';
        popup.innerHTML = `
            <div class="bg-[#181818] w-full max-w-sm rounded-3xl p-6 border border-white/10 text-center relative overflow-hidden" style="animation: slideUp 0.3s ease-out forwards;">
                <div class="relative w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-tr from-[#1ed760] to-green-600 flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
                    <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
                </div>
                <h2 class="text-2xl font-black text-[#1ed760] mb-1">New Version v3 🚀</h2>
                <p class="text-[#6b7280] text-xs mb-5">Berikut adalah fitur dan pembaruan terbaru:</p>
                <div class="space-y-4 text-left mb-6 max-h-[250px] overflow-y-auto pr-1">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="share-2" class="w-4 h-4 text-[#1ed760]"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Share Lagu via Link Audio Langsung</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Bagikan lagu favorit Anda menggunakan link audio langsung untuk kemudahan berbagi musik.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="timer" class="w-4 h-4 text-[#1ed760]"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Timer Sleep (Pengantar Tidur)</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Atur waktu putar musik otomatis sebelum tidur dengan durasi yang dapat ditentukan sendiri.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="shield-check" class="w-4 h-4 text-[#1ed760]"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Fitur Pintar: "Hentikan di Akhir Lagu"</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Dilengkapi opsi agar lagu aktif Anda tetap berputar sampai selesai sebelum pemutaran otomatis berhenti tanpa memotong lagu di tengah-tengah.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="gauge" class="w-4 h-4 text-[#1ed760]"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Kontrol Kecepatan Putar</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Memungkinkan Anda mempercepat atau memperlambat musik sesuai kebutuhan (mendukung kecepatan 0.5x, 0.75x, 1.0x (Normal), 1.25x, 1.5x, 1.75x, hingga 2.0x).</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <i data-lucide="zap" class="w-4 h-4 text-[#1ed760]"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Mode "Slowed + Reverb" & "Nightcore"</h4>
                            <p class="text-[#b3b3b3] text-xs leading-relaxed">Kustomisasi getaran audio dengan mengubah kecepatan musik secara instan ke gaya favorit Anda.</p>
                        </div>
                    </div>
                </div>
                <button id="close-v3-popup" class="w-full bg-[#1ed760] text-black font-bold py-3.5 rounded-full active:scale-95 transition-all">
                    Keren, Mulai Dengar! 🎵
                </button>
            </div>
        `;
        document.body.appendChild(popup);
        lucide.createIcons();
        popup.querySelector('#close-v3-popup').onclick = function() {
            localStorage.setItem('seen_v3_popup_update', 'true');
            popup.remove();
        };
    }
};
App.init();
Home.fetch();

const Library={
    render(){
        var pls=getUserPlaylists();
        var html='<div class="pt-12 px-4"><h1 class="text-3xl font-black mb-4">Library</h1>';
        html+='<button onclick="Library.createNew()" class="w-full bg-[#1ed760] text-black font-bold py-3 rounded-xl active:scale-95 mb-4">+ Buat Playlist Baru</button>';
        if(pls.length===0){
            html+='<div class="text-center text-[#6b7280] mt-10"><i data-lucide="library" class="w-16 h-16 mx-auto mb-4 opacity-30"></i><p>Belum ada playlist</p></div>';
        } else {
            html+='<div class="grid grid-cols-2 gap-3">';
            pls.forEach(function(p){
                html+='<div onclick="Library.open(\''+p.id+'\')" class="bg-[#181818] rounded-xl p-3 cursor-pointer active:scale-95 hover:bg-[#282828] transition-colors"><img src="'+(p.image||FI)+'" class="w-full aspect-square object-cover rounded-lg mb-2" /><h3 class="font-bold text-sm truncate">'+p.name+'</h3><p class="text-[#6b7280] text-xs">'+p.songs.length+' lagu</p></div>';
            });
            html+='</div>';
        }
        html+='</div>';
        gid('view-library').innerHTML=html;
        lucide.createIcons();
    },
    createNew(){
        var popup=document.createElement('div');
        popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
        popup.innerHTML='<div class="bg-[#181818] w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><h3 class="font-bold text-white mb-4">Buat Playlist Baru</h3><input id="pl-name" class="w-full bg-[#282828] text-white rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#1ed760]" placeholder="Nama Playlist" /><input id="pl-image" type="file" accept="image/*" class="w-full text-sm text-[#6b7280] mb-4" /><div class="flex gap-3"><button id="pl-create" class="flex-1 bg-[#1ed760] text-black font-bold py-3 rounded-full">Buat</button><button onclick="this.closest(\'.fixed\').remove()" class="px-6 py-3 border border-white/20 text-white rounded-full">Batal</button></div></div>';
        document.body.appendChild(popup);
        popup.querySelector('#pl-create').onclick=function(){
            var name=gid('pl-name').value.trim()||'Playlist Baru';
            var file=gid('pl-image').files[0];
            if(file){
                var reader=new FileReader();
                reader.onload=function(e){
                    createPlaylist(name,e.target.result);
                    popup.remove();
                    Library.render();
                };
                reader.readAsDataURL(file);
            } else {
                createPlaylist(name,'');
                popup.remove();
                Library.render();
            }
        };
    },
    open(id){
        var pls=getUserPlaylists();
        var pl=pls.find(function(p){return p.id===id;});
        if(!pl)return;
        var html='<div class="pt-12 px-4"><div class="flex items-center gap-3 mb-4"><button onclick="Library.render();App.switch(\'library\')" class="text-white p-2 active:scale-90"><i data-lucide="arrow-left" class="w-6 h-6"></i></button><div><h1 class="text-xl font-bold">'+pl.name+'</h1><p class="text-[#6b7280] text-xs">'+pl.songs.length+' lagu</p></div></div>';
        if(pl.songs.length===0){
            html+='<div class="text-center text-[#6b7280] mt-10"><p>Belum ada lagu</p></div>';
        } else {
            html+='<div class="space-y-1">';
            pl.songs.forEach(function(s,i){
                html+='<div onclick="Library.playSong(\''+id+'\','+i+')" class="flex items-center gap-3 p-3 hover:bg-[#282828] rounded-lg cursor-pointer active:scale-[0.98] transition-colors"><img src="'+getHDImage(s.cover)+'" class="w-10 h-10 rounded object-cover" /><div class="truncate"><p class="font-medium text-sm truncate">'+s.title+'</p><p class="text-[#6b7280] text-xs truncate">'+s.artist+'</p></div></div>';
            });
            html+='</div>';
        }
        html+='</div>';
        gid('view-library').innerHTML=html;
        lucide.createIcons();
    },
    playSong(plId,index){
        var pls=getUserPlaylists();
        var pl=pls.find(function(p){return p.id===plId;});
        if(!pl || !pl.songs[index])return;
        S.pl=pl.songs;
        S.pi=index;
        S.ps='playlist';
        S.ct=S.pl[S.pi];
        S.lyricsLoaded=false;
        S.ld={type:'none',lines:[]};
        S.cli=-1;
        S.lyricsFetching=false;
        UU();
        MP.show();
        S.il=true;
        UB();
        if(S.yp && S.yr && S.ct.videoId) {
            S.yp.loadVideoById({videoId:S.ct.videoId});
        }
        if(S.lo) fetchLyrics(S.ct.videoId);
        resetLyricsUI(S.ct.videoId);
    }
};