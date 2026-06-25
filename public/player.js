const API={search:'/api/search',artist:'/api/artist',suggest:'/api/suggest',lyrics:'/api/lyrics',ytplay:'/api/ytplay'};
const FI='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%232a2a2a"/><text x="150" y="150" text-anchor="middle" dy=".3em" font-size="50" fill="%236b7280">🎵</text></svg>');
const S={ht:[],sr:[],ar:[],sq:'',filter:'all',ct:null,pl:[],pi:-1,ps:'',ip:false,il:false,rm:'off',autoNext:true,yp:null,yr:false,iv:null,pt:0,pd:0,at:'home',ld:{type:'none',lines:[]},cli:-1,lo:false,lyricsLoaded:false,server:'1',lastVideoId:null};
try{S.server=localStorage.getItem('hanzz_server')||'1';}catch(e){}

function fm(s){if(isNaN(s))return"0:00";const m=Math.floor(s/60),se=Math.floor(s%60);return m+':'+(se<10?'0':'')+se;}
function es(t){if(!t)return'';const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function cn(t){if(!t)return'Unknown';return t.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\uFFFF]/g,'').replace(/\s*-\s*Topic$/i,'').trim()||'Unknown';}
function gid(id){return document.getElementById(id);}

function updateOG(title,image){
    var t=document.querySelector('meta[property="og:title"]');
    if(!t){t=document.createElement('meta');t.setAttribute('property','og:title');document.head.appendChild(t);}
    t.setAttribute('content',title+' | HanzzMusify');
    var i=document.querySelector('meta[property="og:image"]');
    if(!i){i=document.createElement('meta');i.setAttribute('property','og:image');document.head.appendChild(i);}
    i.setAttribute('content',image||FI);
    document.title=title+' - HanzzMusify';
}

var yt=document.createElement('script');
yt.src="https://www.youtube.com/iframe_api";
document.head.appendChild(yt);

function onYouTubeIframeAPIReady(){
    S.yp=new YT.Player('yt-player',{
        height:'0',
        width:'0',
        playerVars:{autoplay:1,controls:0,enablejsapi:1,playsinline:1},
        events:{
            onReady:function(){S.yr=true;},
            onStateChange:ys
        }
    });
}

var AU=document.createElement('audio');
AU.id='audio-player';
AU.preload='auto';
AU.style.display='none';
document.body.appendChild(AU);

AU.addEventListener('play',function(){
    if(S.server==='2'){
        S.ip=true;
        S.il=false;
        UB();
        SP();
        if(S.ld.lines.length > 0) {
            S.cli = -1;
            resetLyricsHighlight();
        }
    }
});

AU.addEventListener('pause',function(){
    if(S.server==='2'&&!AU.ended){
        S.ip=false;
        UB();
        ST();
    }
});

AU.addEventListener('waiting',function(){
    if(S.server==='2'){S.il=true;UB();}
});

AU.addEventListener('playing',function(){
    if(S.server==='2'){S.il=false;UB();}
});

AU.addEventListener('ended',function(){
    if(S.server!=='2')return;
    ST();
    if(S.rm==='one'){
        AU.currentTime=0;
        AU.play().catch(function(){});
    }else if(S.autoNext){
        NX();
    }else{
        S.ip=false;
        UB();
    }
});

AU.addEventListener('error',function(){
    if(S.server==='2'&&AU.src){
        S.il=false;
        S.ip=false;
        UB();
        showToast('Server 2 gagal memutar lagu ini');
    }
});

function ys(e){
    if(S.server!=='1')return;
    if(e.data===1){
        S.ip=true;
        S.il=false;
        UB();
        SP();
        if(S.ld.lines.length > 0) {
            S.cli = -1;
            resetLyricsHighlight();
        }
    }else if(e.data===2){
        S.ip=false;
        UB();
        ST();
    }else if(e.data===0){
        ST();
        if(S.rm==='one'){
            if(S.yp && S.yr) {
                S.yp.seekTo(0);
                S.yp.playVideo();
            }
        }else if(S.autoNext){
            NX();
        }
    }else if(e.data===3){
        S.il=true;
        UB();
    }
}

function resetLyricsHighlight() {
    var ls=document.querySelectorAll('.lyric-line');
    ls.forEach(function(l){
        l.style.color='#6b7280';
        l.style.fontSize='0.85rem';
        l.style.fontWeight='400';
        l.style.opacity='0.5';
    });
}

function SP(){
    ST();
    S.iv=setInterval(function(){
        if(S.server==='2'){
            if(!AU.paused){
                S.pt=AU.currentTime||0;
                S.pd=AU.duration||0;
                renderProgress();
            }
        }else if(S.yp && S.yr && S.ip){
            S.pt=S.yp.getCurrentTime()||0;
            S.pd=S.yp.getDuration()||0;
            renderProgress();
        }
    },200);
}

function ST(){
    if(S.iv){
        clearInterval(S.iv);
        S.iv=null;
    }
}

function renderProgress(){
    var p=S.pd>0?(S.pt/S.pd)*100:0;
    var mp=gid('mini-progress'),fp=gid('full-progress'),sb=gid('seek-bar'),tc=gid('time-curr'),td=gid('time-dur');
    if(mp) mp.style.width=p+'%';
    if(fp) fp.style.width=p+'%';
    if(sb) sb.value=p;
    if(tc) tc.innerText=fm(S.pt);
    if(td) td.innerText=fm(S.pd);
    ULH(S.pt);
}

function UB(){
    var mi=gid('mini-play-btn'),fu=gid('full-play-btn');
    if(!mi||!fu)return;
    if(S.il){
        mi.innerHTML='<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
        fu.innerHTML='<div class="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>';
    } else if(S.ip){
        mi.innerHTML='<i data-lucide="pause" class="w-6 h-6 fill-current"></i>';
        fu.innerHTML='<i data-lucide="pause" class="w-7 h-7 fill-current"></i>';
    } else {
        mi.innerHTML='<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
        fu.innerHTML='<i data-lucide="play" class="w-7 h-7 fill-current ml-0.5"></i>';
    }
    lucide.createIcons();
}

function UU(){
    if(!S.ct)return;
    var mc=gid('mini-cover'),mt=gid('mini-title'),ma=gid('mini-artist');
    var fc=gid('full-cover'),ft=gid('full-title'),fa=gid('full-artist');
    var fh=gid('full-header-artist'),fb=gid('full-bg-blur');
    if(mc) mc.src=S.ct.cover;
    if(mt) mt.innerText=S.ct.title;
    if(ma) ma.innerText=S.ct.artist;
    if(fc) fc.src=S.ct.cover;
    if(ft) ft.innerText=S.ct.title;
    if(fa) fa.innerText=S.ct.artist;
    if(fh) fh.innerText=S.ct.artist;
    if(fb) fb.src=S.ct.cover;
    updateOG(S.ct.title,S.ct.cover);
    S.lyricsLoaded=false;
    S.ld={type:'none',lines:[]};
    S.cli=-1;
    S.lastVideoId=S.ct.videoId;
}

function PK(s,i){
    var l=[];
    if(s==='home1') l=S.ht.slice(0,6);
    else if(s==='home2') l=S.ht.slice(6,12);
    else if(s==='search') l=S.sr;
    else if(s==='playlist') l=S.pl;
    if(!l[i])return;
    S.ps=s;
    S.pl=l;
    S.pi=i;
    S.ct=l[i];
    var url=location.origin+'/?play='+S.ct.videoId;
    history.pushState({},'',url);
    S.lyricsLoaded=false;
    S.ld={type:'none',lines:[]};
    S.cli=-1;
    UU();
    MP.show();
    S.il=true;
    UB();
    loadTrack(S.ct);
    if(S.lo) FL(S.ct.videoId);
}

function loadTrack(track,resumeAt){
    if(!track)return;
    ST();
    if(S.server==='2'){
        if(S.yp&&S.yr){try{S.yp.stopVideo();}catch(e){}}
        playViaServer2(track,resumeAt);
    }else{
        try{AU.pause();}catch(e){}
        if(S.yp&&S.yr&&track.videoId){
            S.yp.loadVideoById({videoId:track.videoId});
            if(resumeAt)try{S.yp.seekTo(resumeAt,true);}catch(e){}
        }
    }
}

async function playViaServer2(track,resumeAt){
    S.il=true;UB();
    try{
        var ytUrl=track.ytUrl||('https://youtube.com/watch?v='+track.videoId);
        var r=await fetch(API.ytplay,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:ytUrl})});
        var d=await r.json();
        if(S.ct!==track)return;
        if(d&&d.status&&d.result&&d.result.download&&d.result.download.audio){
            AU.src=d.result.download.audio;
            if(resumeAt){
                var onMeta=function(){AU.currentTime=resumeAt;AU.removeEventListener('loadedmetadata',onMeta);};
                AU.addEventListener('loadedmetadata',onMeta);
            }
            AU.play().catch(function(){});
        }else{
            S.il=false;S.ip=false;UB();showToast('Server 2 gagal memuat lagu ini');
        }
    }catch(e){
        if(S.ct===track){S.il=false;S.ip=false;UB();showToast('Server 2 gagal memuat lagu ini');}
    }
}

function TP(){
    if(!S.ct)return;
    if(S.server==='2'){
        if(!AU.src)return;
        if(AU.paused)AU.play().catch(function(){});else AU.pause();
    }else{
        if(!S.yp||!S.yr)return;
        S.ip?S.yp.pauseVideo():S.yp.playVideo();
    }
}

function NX(){
    if(!S.pl.length)return;
    var ni=S.pi+1;
    if(ni>=S.pl.length){
        if(S.rm==='all') ni=0;
        else { S.ip=false; UB(); return; }
    }
    PK(S.ps,ni);
}

function PV(){
    if(!S.pl.length)return;
    if(S.pt>3){
        if(S.server==='2'){AU.currentTime=0;}else if(S.yp&&S.yr){S.yp.seekTo(0);}
        return;
    }
    var pi=S.pi-1;
    if(pi<0) pi=S.pl.length-1;
    PK(S.ps,pi);
}

function SK(v){
    if(S.server==='2'){
        if(AU.duration)AU.currentTime=(parseFloat(v)/100)*AU.duration;
    }else{
        if(S.yp&&S.yr&&S.pd>0)S.yp.seekTo((parseFloat(v)/100)*S.pd,true);
    }
}

function TR(){
    var b=gid('btn-repeat'),d=gid('repeat-dot'),o=gid('repeat-one');
    if(S.rm==='off'){
        S.rm='all';
        b.classList.add('text-[#1ed760]');
        d.classList.remove('hidden');
    } else if(S.rm==='all'){
        S.rm='one';
        o.classList.remove('hidden');
    } else {
        S.rm='off';
        b.classList.remove('text-[#1ed760]');
        d.classList.add('hidden');
        o.classList.add('hidden');
    }
}

function SF(){
    if(S.pl.length) PK(S.ps,Math.floor(Math.random()*S.pl.length));
}

function toggleAutoNext(){
    S.autoNext=!S.autoNext;
    showToast(S.autoNext?'Auto Next: ON':'Auto Next: OFF');
}

function shareTrack(){
    if(!S.ct || !S.ct.videoId) return;
    var url=location.origin+'/?play='+S.ct.videoId+'&share=1';
    updateOG(S.ct.title,S.ct.cover);
    if(navigator.share){
        navigator.share({
            title:S.ct.title,
            text:'🎵 '+S.ct.title+' - '+S.ct.artist,
            url:url
        }).catch(function(){});
    }
}

function FL(vid){
    var c=gid('lyrics-content');
    if(!c) return;
    
    if(S.ct && S.ct.videoId !== vid) {
        return;
    }
    
    c.innerHTML='<div class="loading-center"><div class="w-8 h-8 border-3 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div><p class="text-[#6b7280] text-sm">Memuat lirik...</p></div>';
    S.ld={type:'none',lines:[]};
    S.cli=-1;
    S.lyricsLoaded=false;
    
    try{
        var r=await fetch(API.lyrics+'?id='+vid+'&t='+Date.now());
        var d=await r.json();
        
        if(S.ct && S.ct.videoId !== vid) {
            return;
        }
        
        if(d.status && d.result.lyrics && d.result.lyrics.lines && d.result.lyrics.lines.length>0){
            S.ld=d.result.lyrics;
            S.lyricsLoaded=true;
            var html='';
            S.ld.lines.forEach(function(li,i){
                html+='<p class="lyric-line text-left px-2" data-time="'+li.time+'" data-index="'+i+'" onclick="SLT('+li.time+')">'+es(li.text)+'</p>';
            });
            html+='<p class="text-center text-[#4b5563] text-xs mt-8 mb-4 opacity-50 tracking-widest">——— end ———</p>';
            c.innerHTML=html;
            if(S.ip && S.pt > 0) {
                setTimeout(function(){ ULH(S.pt); }, 100);
            }
        }else{
            c.innerHTML='<div class="loading-center"><i data-lucide="music" class="w-16 h-16 opacity-30"></i><p class="text-[#6b7280]">Lirik tidak tersedia</p></div>';
            lucide.createIcons();
        }
    }catch(er){
        if(S.ct && S.ct.videoId !== vid) return;
        c.innerHTML='<div class="loading-center"><i data-lucide="music" class="w-16 h-16 opacity-30"></i><p class="text-[#6b7280]">Lirik tidak tersedia</p></div>';
        lucide.createIcons();
    }
}

function ULH(ct){
    if(!S.ld || S.ld.lines.length===0) return;
    var ls=document.querySelectorAll('.lyric-line');
    if(!ls || ls.length===0) return;
    var ni=-1;
    for(var i=0;i<S.ld.lines.length;i++){
        if(ct >= S.ld.lines[i].time){
            ni=i;
        }
    }
    if(ni === S.cli) return;
    ls.forEach(function(l){
        l.style.color='#6b7280';
        l.style.fontSize='0.85rem';
        l.style.fontWeight='400';
        l.style.opacity='0.5';
    });
    for(var i=0; i<ls.length; i++){
        if(i < ni){
            ls[i].style.color='#4b5563';
            ls[i].style.opacity='0.3';
        }
        if(i === ni){
            ls[i].style.color='#ffffff';
            ls[i].style.fontSize='1.05rem';
            ls[i].style.fontWeight='700';
            ls[i].style.opacity='1';
            setTimeout(function(el){
                el.scrollIntoView({behavior:'smooth',block:'center'});
            }, 50, ls[i]);
        }
    }
    S.cli=ni;
}

function SLT(t){
    if(S.server==='2'){
        if(AU.duration)AU.currentTime=t;
    }else{
        if(S.yp && S.yr) S.yp.seekTo(t,true);
    }
}

function toggleLyrics(){
    var o=gid('lyrics-overlay');
    if(!o) return;
    if(S.lo){
        o.style.transform='translateY(100%)';
        setTimeout(function(){o.style.display='none';},400);
        S.lo=false;
        MP.show();
    }else{
        o.style.display='flex';
        requestAnimationFrame(function(){
            requestAnimationFrame(function(){
                o.style.transform='translateY(0)';
            });
        });
        S.lo=true;
        MP.hide();
        if(S.ct && S.ct.videoId){
            FL(S.ct.videoId);
        }
    }
}

function getUserPlaylists(){
    try{return JSON.parse(localStorage.getItem('hanzz_playlists')||'[]');}
    catch(e){return[];}
}

function saveUserPlaylists(pls){
    try{localStorage.setItem('hanzz_playlists',JSON.stringify(pls));}
    catch(e){}
}

function createPlaylist(name,image){
    var pls=getUserPlaylists();
    var id='pl_'+Date.now();
    pls.push({id:id,name:name,image:image||'',songs:[]});
    saveUserPlaylists(pls);
    return id;
}

function addToPlaylistById(playlistId,track){
    var pls=getUserPlaylists();
    var pl=pls.find(function(p){return p.id===playlistId;});
    if(!pl)return;
    var exists=pl.songs.find(function(s){return s.videoId===track.videoId;});
    if(!exists){
        pl.songs.push({
            id:track.id,
            videoId:track.videoId,
            title:track.title,
            artist:track.artist,
            cover:track.cover,
            artistId:track.artistId||'',
            ytUrl:track.ytUrl
        });
        if(!pl.image && pl.songs.length===1){
            pl.image=track.cover;
        }
        saveUserPlaylists(pls);
        showToast('Added to '+pl.name);
    }else{
        showToast('Already in playlist');
    }
}

function showToast(msg){
    var toast=document.createElement('div');
    toast.className='fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1ed760] text-black font-bold px-5 py-2.5 rounded-full shadow-2xl z-[999]';
    toast.style.animation='slideUp 0.3s ease-out forwards';
    toast.innerText=msg;
    document.body.appendChild(toast);
    setTimeout(function(){toast.remove();},2000);
}

function addCurrentToPlaylist(){
    if(!S.ct)return;
    var pls=getUserPlaylists();
    if(pls.length===0){
        showToast('No playlist! Create one in Library');
        return;
    }
    showPlaylistPicker(S.ct);
}

function showPlaylistPicker(track){
    var pls=getUserPlaylists();
    var popup=document.createElement('div');
    popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick=function(e){if(e.target===popup)popup.remove();};
    var listHtml=pls.map(function(p){
        return '<button onclick="addToPlaylistById(\''+p.id+'\',S.ct);this.closest(\'.fixed\').remove();" class="w-full text-left p-4 hover:bg-[#282828] flex items-center gap-3 border-b border-white/5 transition-colors"><img src="'+(p.image||FI)+'" class="w-10 h-10 rounded object-cover" /><div><p class="font-medium text-white">'+p.name+'</p><p class="text-[#6b7280] text-xs">'+p.songs.length+' songs</p></div></button>';
    }).join('');
    popup.innerHTML='<div class="bg-[#181818] w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;"><div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div><h3 class="font-bold text-white mb-3">Add to Playlist</h3><div class="max-h-72 overflow-y-auto hide-scrollbar">'+listHtml+'</div><button onclick="this.closest(\'.fixed\').remove()" class="w-full mt-3 py-3 border border-white/20 text-white rounded-full">Cancel</button></div>';
    document.body.appendChild(popup);
}

function setServer(v){
    if(S.server===v){closeServerSettings();return;}
    var prevTime=S.pt||0,hadTrack=!!S.ct;
    S.server=v;
    try{localStorage.setItem('hanzz_server',v);}catch(e){}
    if(v==='1'&&'Notification' in window&&Notification.permission==='default'){
        Notification.requestPermission().then(function(perm){
            if(perm==='granted')showToast('Izin notifikasi diberikan');
            else showToast('Tanpa izin notifikasi, pemutaran di background bisa terhenti');
        }).catch(function(){});
    }
    closeServerSettings();
    showToast('Server pemutar diganti ke Server '+v);
    if(hadTrack){S.il=true;UB();loadTrack(S.ct,prevTime);}
}

function openServerSettings(){
    closeServerSettings();
    var s1=S.server==='1',s2=S.server==='2';
    var popup=document.createElement('div');
    popup.id='server-settings-popup';
    popup.className='fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick=function(e){if(e.target===popup)closeServerSettings();};
    popup.innerHTML='<div class="bg-[#181818] w-full max-w-md rounded-t-3xl p-6 border-t border-white/10" style="animation:slideUp 0.3s ease-out forwards;">'+
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>'+
        '<h3 class="font-bold text-white mb-1">Pengaturan Server</h3>'+
        '<p class="text-[#6b7280] text-xs mb-4">Pilih server pemutaran yang sesuai kebutuhanmu</p>'+
        '<button onclick="setServer(\'1\')" class="w-full text-left p-4 rounded-2xl mb-3 border '+(s1?'border-[#1ed760] bg-[#1ed760]/10':'border-white/10 hover:bg-white/5')+' transition-all">'+
            '<div class="flex items-center justify-between"><span class="font-bold text-white">Server 1</span>'+(s1?'<i data-lucide="check-circle" class="w-5 h-5 text-[#1ed760]"></i>':'')+'</div>'+
            '<p class="text-[#b3b3b3] text-xs mt-1">Lebih cepat, tapi perlu izin notifikasi agar tetap jalan saat aplikasi di background.</p>'+
        '</button>'+
        '<button onclick="setServer(\'2\')" class="w-full text-left p-4 rounded-2xl mb-2 border '+(s2?'border-[#1ed760] bg-[#1ed760]/10':'border-white/10 hover:bg-white/5')+' transition-all">'+
            '<div class="flex items-center justify-between"><span class="font-bold text-white">Server 2</span>'+(s2?'<i data-lucide="check-circle" class="w-5 h-5 text-[#1ed760]"></i>':'')+'</div>'+
            '<p class="text-[#b3b3b3] text-xs mt-1">Sedikit lebih lambat memuat lagu, tapi tidak perlu izin notifikasi untuk tetap jalan di background.</p>'+
        '</button>'+
        '<button onclick="closeServerSettings()" class="w-full mt-3 py-3 border border-white/20 text-white rounded-full">Tutup</button>'+
    '</div>';
    document.body.appendChild(popup);
    lucide.createIcons();
}

function closeServerSettings(){var p=gid('server-settings-popup');if(p)p.remove();}