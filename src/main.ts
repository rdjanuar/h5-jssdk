const urlParams = new URLSearchParams(window.location.search);
const root = urlParams.get('root');
const path = urlParams.get('path');

declare global {
  interface Window {
    wx: any;
  }
}

if (root && path) {
  console.log('Loading TCMPP JSSDK...');
  const script = document.createElement('script');
  script.src = 'https://tcmpp-team.github.io/mini-programs/jssdk/tcsas-jssdk-1.0.1.js';
  script.async = true;
  document.body.appendChild(script);

  const redirectPath = decodeURIComponent(path);

  const attemptRedirect = () => {
    if (wx && wx.miniProgram) {
      wx.miniProgram.navigateTo({
        url: redirectPath,
        success: () => console.log('Redirect success'),
        fail: (err: any) => console.error('Redirect failed', err)
      });
    } else {
      console.error('wx.miniProgram is not available');
    }
  };

  script.onload = () => {
    console.log('TCMPP JSSDK loaded successfully.');
    wx.miniProgram.getEnv((res: any) => {
      if (res.miniprogram) {
        attemptRedirect();
      }
    });
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
