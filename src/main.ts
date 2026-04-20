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
    if (window.wx && window.wx.miniProgram) {
      window.wx.miniProgram.navigateTo({
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
    window.wx.miniProgram.getEnv((res: any) => {
      if (res.miniprogram) {
        attemptRedirect();
      }
    });
  };

  script.onerror = () => {
    console.error('Failed to load TCMPP JSSDK.');
  };

  setTimeout(() => {
    const btn = document.createElement('button');
    btn.innerText = 'Kembali ke Aplikasi';
    btn.style.marginTop = '20px';
    btn.style.padding = '10px 20px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = '#007aff';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';

    btn.onclick = () => attemptRedirect();
    
    document.body.appendChild(btn);
  }, 3000);
}
