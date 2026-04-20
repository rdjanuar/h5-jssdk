const urlParams = new URLSearchParams(window.location.search);
const root = urlParams.get('root');
const path = urlParams.get('path');

declare global {
  interface Window {
    wx: any;
    tcsas: any;
    WeixinJSBridge: any;
  }
}

if (root && path) {
  console.log('Loading TCMPP JSSDK...');
  
  let redirectPath = decodeURIComponent(path);
  if (redirectPath.startsWith('"') && redirectPath.endsWith('"')) {
    redirectPath = redirectPath.slice(1, -1);
  }

  const attemptRedirect = () => {
    const sdk = window.wx || window.tcsas;
    if (sdk && sdk.miniProgram) {
      sdk.miniProgram.switchTab({
        url: redirectPath,
        success: () => console.log('switchTab success to', redirectPath),
        fail: () => {
          sdk.miniProgram.reLaunch({
            url: redirectPath,
            success: () => console.log('reLaunch success to', redirectPath),
            fail: () => {
              sdk.miniProgram.navigateTo({
                url: redirectPath,
                success: () => console.log('navigateTo success to', redirectPath),
                fail: (err: any) => alert('All redirects failed: ' + JSON.stringify(err))
              });
            }
          });
        }
      });
    } else {
      alert('SDK (wx/tcsas) .miniProgram is not available on window');
    }
  };

  const script = document.createElement('script');
  script.src = 'https://tcmpp-team.github.io/mini-programs/jssdk/tcsas-jssdk-1.0.1.js';
  script.async = true;

  script.onload = () => {
    console.log('TCMPP JSSDK loaded successfully.');
    setTimeout(() => {
      const sdk = window.wx || window.tcsas;
      
      if (!sdk && window.WeixinJSBridge) {
         window.WeixinJSBridge.invoke('navigateTo', { url: redirectPath });
         return;
      }

      if (sdk && sdk.miniProgram) {
        sdk.miniProgram.getEnv((res: any) => {
          if (res.miniprogram) {
            attemptRedirect();
          } else {
            attemptRedirect();
          }
        });
      } else {
        alert('JSSDK loaded, but wx.miniProgram is undefined. Are you inside TCMPP web-view?');
      }
    }, 100);
  };

  script.onerror = () => {
    alert('Failed to load TCMPP JSSDK script from network.');
  };

  document.head.appendChild(script);

  let timeLeft = 3;
  const countdownEl = document.getElementById('countdown');
  const loadingMsgEl = document.getElementById('loading-message');

  const timer = setInterval(() => {
    timeLeft -= 1;
    if (countdownEl) {
      countdownEl.innerText = timeLeft.toString();
    }
    
    if (timeLeft <= 0) {
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
