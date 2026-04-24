import '@fontsource/poppins/index.css';

const urlParams = new URLSearchParams(window.location.search);
const root = urlParams.get('root');
const path = urlParams.get('path');

declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}

if ((root && root === 'miniapp') && path) {
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
      attemptRedirect()
    }, 0)
  };

  script.onerror = () => {
    alert('Failed to load TCMPP JSSDK script from network.');
  };

  document.head.appendChild(script);

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      attemptRedirect();
    });
  }
}
