export function parseIncomingParams(search: string): URLSearchParams {
  const incomingParams = new URLSearchParams(search);
  const entries = [...incomingParams.entries()];
  const packedIndex = entries.findIndex(([key, value]) => value === "" && key.includes("="));
  if (packedIndex === -1) return incomingParams;

  const packedParams = new URLSearchParams(entries[packedIndex][0]);
  if (packedParams.get("payment")?.toLowerCase() !== "ovo") return incomingParams;

  entries.forEach(([key, value], index) => {
    if (index !== packedIndex) {
      packedParams.append(key, value);
    }
  });
  return packedParams;
}
