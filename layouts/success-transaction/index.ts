export function initSuccessTransaction(
  attemptRedirect: (extraParams?: Record<string, string>) => void,
  urlParams: URLSearchParams
) {
  const btnFinance = document.getElementById("btn-finance");
  if (btnFinance) {
    btnFinance.addEventListener("click", () => {
      attemptRedirect();
    });
  }

  const btnHistory = document.getElementById("btn-history");
  if (btnHistory) {
    btnHistory.addEventListener("click", () => {
      // Look for the payment method in the H5 URL parameters (generic variants)
      const paymentMethod = urlParams.get("payment") || "";

      attemptRedirect({
        action: "history_page",
        payment_method: paymentMethod,
      });
    });
  }
}
