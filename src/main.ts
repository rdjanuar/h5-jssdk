const urlParams = new URLSearchParams(window.location.search);
const root = urlParams.get('root');
const path = urlParams.get('path');

declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}

if (root && path) {
  console.log('Loading TCMPP JSSDK...');
  const script = document.createElement('script');
  script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
  script.async = true;
  document.head.appendChild(script);

  let redirectPath = decodeURIComponent(path);
  if (redirectPath.startsWith('"') && redirectPath.endsWith('"')) {
    redirectPath = redirectPath.slice(1, -1);
  }

  const attemptRedirect = () => {
    const sdk = window.wx || window.tcsas;
    if (sdk && sdk.miniProgram) {
      sdk.miniProgram.navigateTo({
        url: redirectPath,
        success: () => alert(`Redirect success to ${redirectPath}`),
        fail: (err: any) => alert(`Redirect failed to ${err}`)
      });
    } else {
      console.error('SDK (wx/tcsas) .miniProgram is not available on window');
    }
  };

  script.onload = () => {
    console.log('TCMPP JSSDK loaded successfully.');
    alert('sdl loaded')
    const sdk = window.wx || window.tcsas;
    if (sdk && sdk.miniProgram) {
      sdk.miniProgram.getEnv((res: any) => {
        if (res.miniprogram) {
          attemptRedirect();
        }
      });
    }
  };

  script.onerror = () => {
    console.error('Failed to load TCMPP JSSDK.');
  };

  let timeLeft = 3;
  const countdownEl = document.getElementById('countdown');
  const loadingMsgEl = document.getElementById('loading-message');

  const timer = setInterval(() => {
    timeLeft -= 1;
    if (countdownEl) {
      console.log(countdownEl)
      countdownEl.innerText = timeLeft.toString();
    }
    
    if (timeLeft <= 0) {
      attemptRedirect()
      clearInterval(timer);
      if (loadingMsgEl) {
        loadingMsgEl.style.display = 'none';
      }

      const btn = document.createElement('button');
      btn.innerText = 'Kembali ke Aplikasi';
      btn.className = 'counter'; 
      btn.style.cursor = 'pointer';
      btn.style.marginBottom = '0';

      btn.onclick = () => attemptRedirect();
      
      const container = document.getElementById('app-container');
      if (container) {
        container.appendChild(btn);
      } else {
        document.body.appendChild(btn);
      }
    }
  }, 1000);
}
