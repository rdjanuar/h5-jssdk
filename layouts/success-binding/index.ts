const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('authCode')

export function initSuccessBinding(
  attemptRedirect: (extraParams?: Record<string, string>) => void
) {
  const btnFinance = document.getElementById("btn-finance");
  if (btnFinance) {
    btnFinance.addEventListener("click", () => {
      attemptRedirect();
    });
  }
}

if (window.wx?.miniProgram) {
  window.wx.miniProgram.sendWebviewEvent({
    scope: 'success_binding',
    action: 'binding_auth_code',
    payload: {
      authCode
    }
  })
}